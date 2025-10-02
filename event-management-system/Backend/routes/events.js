const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('status').optional().isIn(['draft', 'active', 'cancelled', 'completed', 'postponed']).withMessage('Invalid status'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('city').optional().isString().withMessage('City must be a string'),
  query('dateFrom').optional().isISO8601().withMessage('DateFrom must be a valid date'),
  query('dateTo').optional().isISO8601().withMessage('DateTo must be a valid date'),
  query('priceMin').optional().isFloat({ min: 0 }).withMessage('PriceMin must be a positive number'),
  query('priceMax').optional().isFloat({ min: 0 }).withMessage('PriceMax must be a positive number'),
  query('sortBy').optional().isIn(['date', 'title', 'price', 'createdAt', 'views']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('featured').optional().isBoolean().withMessage('Featured must be boolean'),
  query('upcoming').optional().isBoolean().withMessage('Upcoming must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 10,
      category,
      status = 'active',
      search,
      city,
      dateFrom,
      dateTo,
      priceMin,
      priceMax,
      sortBy = 'date',
      sortOrder = 'asc',
      featured,
      upcoming
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (city) filter['venue.city'] = new RegExp(city, 'i');

    // Date range filter
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    // Price range filter
    if (priceMin !== undefined || priceMax !== undefined) {
      filter.price = {};
      if (priceMin !== undefined) filter.price.$gte = parseFloat(priceMin);
      if (priceMax !== undefined) filter.price.$lte = parseFloat(priceMax);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Featured events (high views or attendees)
    if (featured === 'true') {
      filter.$or = [
        { 'statistics.views': { $gte: 100 } },
        { currentAttendees: { $gte: 50 } }
      ];
    }

    // Upcoming events
    if (upcoming === 'true') {
      filter.date = { ...filter.date, $gte: new Date() };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const events = await Event.find(filter)
      .populate('organizer', 'name email')
      .populate('coOrganizers', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-speakers -agenda -materials -socialMedia -settings -statistics');

    const total = await Event.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email phone')
      .populate('coOrganizers', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Increment view count
    await event.incrementViews();

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/categories/list
// @desc    Get all event categories
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Event.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/featured
// @desc    Get featured events
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const events = await Event.getPopularEvents(6);
    res.json(events);
  } catch (error) {
    console.error('Get featured events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/upcoming
// @desc    Get upcoming events
// @access  Public
router.get('/upcoming', async (req, res) => {
  try {
    const events = await Event.find({
      status: 'active',
      date: { $gte: new Date() }
    })
    .sort({ date: 1 })
    .limit(10)
    .populate('organizer', 'name email')
    .select('-speakers -agenda -materials -socialMedia -settings -statistics');

    res.json(events);
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/analytics/overview
// @desc    Get event analytics overview
// @access  Admin
router.get('/analytics/overview', adminAuth, async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ status: 'active' });
    const draftEvents = await Event.countDocuments({ status: 'draft' });
    const cancelledEvents = await Event.countDocuments({ status: 'cancelled' });
    const completedEvents = await Event.countDocuments({ status: 'completed' });

    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('organizer', 'name email')
      .select('title status date organizer createdAt');

    const totalAttendees = await Event.aggregate([
      { $group: { _id: null, total: { $sum: '$currentAttendees' } } }
    ]);

    const popularCategories = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const eventsByMonth = await Event.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalEvents,
      activeEvents,
      draftEvents,
      cancelledEvents,
      completedEvents,
      totalAttendees: totalAttendees[0]?.total || 0,
      recentEvents,
      popularCategories,
      eventsByMonth
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Admin
router.post('/', adminAuth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('maxAttendees').isInt({ min: 1 }).withMessage('Max attendees must be at least 1'),
  body('category').isIn(['conference', 'workshop', 'seminar', 'meeting', 'party', 'networking', 'training', 'exhibition', 'concert', 'sports', 'other']).withMessage('Invalid category'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).withMessage('Invalid currency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      organizer: req.user.id,
      status: req.body.status || 'draft'
    };

    const event = new Event(eventData);
    await event.save();

    // Populate organizer data
    await event.populate('organizer', 'name email');

    // Send notification to organizer if event is published
    if (event.status === 'active') {
      const notification = new Notification({
        user: req.user.id,
        type: 'event_published',
        title: 'Event Published',
        message: `Your event "${event.title}" has been published successfully.`,
        relatedEvent: event._id
      });
      await notification.save();
    }

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Admin or Event Organizer
router.put('/:id', auth, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('maxAttendees').optional().isInt({ min: 1 }).withMessage('Max attendees must be at least 1'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is admin or event organizer
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    // Store original data for comparison
    const originalData = {
      title: event.title,
      date: event.date,
      location: event.location,
      maxAttendees: event.maxAttendees,
      price: event.price
    };

    // Update event
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        event[key] = req.body[key];
      }
    });

    event.updatedAt = new Date();
    await event.save();

    // Check for significant changes and send notifications
    const significantChanges = [];
    if (originalData.title !== event.title) significantChanges.push('title');
    if (originalData.date.getTime() !== event.date.getTime()) significantChanges.push('date');
    if (originalData.location !== event.location) significantChanges.push('location');
    if (originalData.maxAttendees !== event.maxAttendees) significantChanges.push('capacity');
    if (originalData.price !== event.price) significantChanges.push('price');

    if (significantChanges.length > 0) {
      // Get all users who have booked this event
      const Booking = require('../models/Booking');
      const bookings = await Booking.find({ event: event._id }).populate('user');
      
      // Send notifications to all attendees
      for (const booking of bookings) {
        const notification = new Notification({
          user: booking.user._id,
          type: 'event_updated',
          title: 'Event Updated',
          message: `The event "${event.title}" has been updated. Changes: ${significantChanges.join(', ')}.`,
          relatedEvent: event._id
        });
        await notification.save();
      }
    }

    await event.populate('organizer', 'name email');
    await event.populate('coOrganizers', 'name email');

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Admin or Event Organizer
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is admin or event organizer
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Cancel all bookings for this event
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({ event: event._id }).populate('user');
    
    // Send cancellation notifications
    for (const booking of bookings) {
      const notification = new Notification({
        user: booking.user._id,
        type: 'event_cancelled',
        title: 'Event Cancelled',
        message: `The event "${event.title}" has been cancelled.`,
        relatedEvent: event._id
      });
      await notification.save();
    }

    // Update booking statuses
    await Booking.updateMany(
      { event: event._id },
      { status: 'cancelled' }
    );

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id/status
// @desc    Update event status
// @access  Admin or Event Organizer
router.put('/:id/status', auth, [
  body('status').isIn(['draft', 'active', 'cancelled', 'completed', 'postponed']).withMessage('Invalid status'),
  body('cancellationReason').optional().isString().withMessage('Cancellation reason must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is admin or event organizer
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const oldStatus = event.status;
    const newStatus = req.body.status;

    event.status = newStatus;
    
    if (newStatus === 'cancelled' || newStatus === 'postponed') {
      event.cancellationReason = req.body.cancellationReason || 'No reason provided';
      event.cancellationDate = new Date();

      // Get all bookings and send notifications
      const Booking = require('../models/Booking');
      const bookings = await Booking.find({ event: event._id }).populate('user');
      
      for (const booking of bookings) {
        const notification = new Notification({
          user: booking.user._id,
          type: newStatus === 'cancelled' ? 'event_cancelled' : 'event_postponed',
          title: `Event ${newStatus === 'cancelled' ? 'Cancelled' : 'Postponed'}`,
          message: `The event "${event.title}" has been ${newStatus}. ${event.cancellationReason}`,
          relatedEvent: event._id
        });
        await notification.save();
      }

      // Update booking statuses
      await Booking.updateMany(
        { event: event._id },
        { status: newStatus === 'cancelled' ? 'cancelled' : 'pending' }
      );
    }

    await event.save();

    res.json({
      message: `Event status updated to ${newStatus}`,
      event
    });
  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id/attendees
// @desc    Get event attendees
// @access  Admin or Event Organizer
router.get('/:id/attendees', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is admin or event organizer
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view attendees' });
    }

    const Booking = require('../models/Booking');
    const bookings = await Booking.find({ 
      event: event._id,
      status: { $in: ['confirmed', 'pending'] }
    })
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get attendees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/duplicate
// @desc    Duplicate an event
// @access  Admin or Event Organizer
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalEvent = await Event.findById(req.params.id);
    if (!originalEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is admin or event organizer
    if (req.user.role !== 'admin' && originalEvent.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to duplicate this event' });
    }

    // Create new event with modified data
    const eventData = originalEvent.toObject();
    delete eventData._id;
    delete eventData.createdAt;
    delete eventData.updatedAt;
    delete eventData.currentAttendees;
    delete eventData.waitlistCount;
    delete eventData.statistics;

    // Set new organizer and status
    eventData.organizer = req.user.id;
    eventData.status = 'draft';
    eventData.title = `${eventData.title} (Copy)`;
    
    // Set date to 7 days from now
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 7);
    eventData.date = newDate;

    const newEvent = new Event(eventData);
    await newEvent.save();

    await newEvent.populate('organizer', 'name email');

    res.status(201).json({
      message: 'Event duplicated successfully',
      event: newEvent
    });
  } catch (error) {
    console.error('Duplicate event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/export/csv
// @desc    Export events to CSV
// @access  Admin
router.get('/export/csv', adminAuth, async (req, res) => {
  try {
    const { status, category, dateFrom, dateTo } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const events = await Event.find(filter)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });

    // Convert to CSV format
    const csvHeader = 'Title,Description,Date,Time,Location,Category,Max Attendees,Current Attendees,Price,Status,Organizer,Created At\n';
    const csvRows = events.map(event => {
      return [
        `"${event.title}"`,
        `"${event.description.replace(/"/g, '""')}"`,
        event.date.toISOString().split('T')[0],
        event.time,
        `"${event.location}"`,
        event.category,
        event.maxAttendees,
        event.currentAttendees,
        event.price,
        event.status,
        `"${event.organizer.name}"`,
        event.createdAt.toISOString()
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=events.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;