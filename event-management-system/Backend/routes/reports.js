const express = require('express');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reports/dashboard
// @desc    Get dashboard analytics
// @access  Private (Admin)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get basic counts
    const [
      totalUsers,
      totalEvents,
      totalBookings,
      activeEvents,
      pendingBookings,
      approvedBookings,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Booking.countDocuments(),
      Event.countDocuments({ status: 'active' }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'approved' }),
      Booking.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Get recent activity
    const recentEvents = await Event.find()
      .populate('organizer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('event', 'title')
      .sort({ bookingDate: -1 })
      .limit(5);

    // Get event participation data
    const eventParticipation = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAttendees: { $sum: '$currentAttendees' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get monthly booking trends
    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$bookingDate' },
            month: { $month: '$bookingDate' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalEvents,
        totalBookings,
        activeEvents,
        pendingBookings,
        approvedBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentActivity: {
        events: recentEvents,
        bookings: recentBookings
      },
      analytics: {
        eventParticipation,
        monthlyBookings
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/events
// @desc    Get event participation report
// @access  Private (Admin)
router.get('/events', adminAuth, async (req, res) => {
  try {
    const { eventId } = req.query;
    
    if (eventId) {
      // Get specific event participation
      const event = await Event.findById(eventId).populate('organizer', 'name email');
      const bookings = await Booking.find({ event: eventId, status: 'approved' })
        .populate('user', 'name email phone')
        .sort({ bookingDate: -1 });

      res.json({
        event,
        participants: bookings,
        totalParticipants: bookings.length
      });
    } else {
      // Get all events with participation data
      const events = await Event.find()
        .populate('organizer', 'name')
        .sort({ date: -1 });

      const eventsWithParticipation = await Promise.all(
        events.map(async (event) => {
          const participantCount = await Booking.countDocuments({
            event: event._id,
            status: 'approved'
          });
          
          return {
            ...event.toObject(),
            participantCount
          };
        })
      );

      res.json(eventsWithParticipation);
    }
  } catch (error) {
    console.error('Get event participation report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/users
// @desc    Get user activity report
// @access  Private (Admin)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    const usersWithActivity = await Promise.all(
      users.map(async (user) => {
        const bookingCount = await Booking.countDocuments({ user: user._id });
        const eventCount = await Event.countDocuments({ organizer: user._id });
        
        return {
          ...user.toObject(),
          bookingCount,
          eventCount
        };
      })
    );

    res.json(usersWithActivity);
  } catch (error) {
    console.error('Get user activity report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
