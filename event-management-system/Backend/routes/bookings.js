const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get all bookings (Admin only)
// @access  Private (Admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'name email')
      .populate('event', 'title date location')
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/user/:userId
// @desc    Get user's booking history
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Users can only view their own bookings unless they're admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bookings = await Booking.find({ user: req.params.userId })
      .populate('event', 'title date time location price category')
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bookings
// @desc    Create new booking (goes to pending status)
// @access  Private
router.post('/', [
  auth,
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, notes } = req.body;

    // Check if event exists and is active
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'active') {
      return res.status(400).json({ message: 'Event is not available for booking' });
    }

    // Check if event has available spots
    if (event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is fully booked' });
    }

    // Check if user already has a booking for this event
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      event: eventId
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You have already requested booking for this event' });
    }

    // Create booking with pending status
    const booking = new Booking({
      user: req.user._id,
      event: eventId,
      amount: event.price,
      notes,
      status: 'pending'
    });

    await booking.save();

    // Create notification for admin
    const Notification = require('../models/Notification');
    await Notification.create({
      user: event.organizer, // Notify event organizer
      type: 'booking_pending', // New booking request
      title: 'New Booking Request',
      message: `${req.user.name} has requested to book your event "${event.title}"`,
      relatedEvent: eventId,
      relatedBooking: booking._id
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('event', 'title date time location price');

    res.status(201).json({
      message: 'Booking request submitted successfully. Waiting for approval.',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking status
// @access  Private
router.put('/:id', [
  auth,
  body('status').optional().isIn(['confirmed', 'cancelled', 'pending']).withMessage('Invalid status'),
  body('paymentStatus').optional().isIn(['paid', 'pending', 'refunded']).withMessage('Invalid payment status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Users can only update their own bookings unless they're admin
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, paymentStatus } = req.body;

    // If cancelling booking, update event attendee count
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      const event = await Event.findById(booking.event);
      if (event && event.currentAttendees > 0) {
        event.currentAttendees -= 1;
        await event.save();
      }
    }

    // If reactivating cancelled booking, update event attendee count
    if (booking.status === 'cancelled' && status === 'confirmed') {
      const event = await Event.findById(booking.event);
      if (event && event.currentAttendees < event.maxAttendees) {
        event.currentAttendees += 1;
        await event.save();
      } else if (event && event.currentAttendees >= event.maxAttendees) {
        return res.status(400).json({ message: 'Event is now fully booked' });
      }
    }

    // Update booking
    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('event', 'title date time location price');

    res.json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel booking
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Users can only cancel their own bookings unless they're admin
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update event attendee count
    const event = await Event.findById(booking.event);
    if (event && event.currentAttendees > 0) {
      event.currentAttendees -= 1;
      await event.save();
    }

    // Cancel booking
    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/approve
// @desc    Approve booking (Admin only)
// @access  Private (Admin)
router.put('/:id/approve', adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be approved' });
    }

    // Check if event still has available spots
    if (booking.event.currentAttendees >= booking.event.maxAttendees) {
      return res.status(400).json({ message: 'Event is now fully booked' });
    }

    // Update booking status
    booking.status = 'approved';
    await booking.save();

    // Update event attendee count
    booking.event.currentAttendees += 1;
    await booking.event.save();

    // Create notification for user
    await Notification.create({
      user: booking.user._id,
      type: 'booking_approved',
      title: 'Booking Approved',
      message: `Your booking for "${booking.event.title}" has been approved!`,
      relatedEvent: booking.event._id,
      relatedBooking: booking._id
    });

    const updatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('event', 'title date time location price');

    res.json({
      message: 'Booking approved successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/reject
// @desc    Reject booking (Admin only)
// @access  Private (Admin)
router.put('/:id/reject', adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be rejected' });
    }

    // Update booking status
    booking.status = 'rejected';
    await booking.save();

    // Create notification for user
    await Notification.create({
      user: booking.user._id,
      type: 'booking_rejected',
      title: 'Booking Rejected',
      message: `Your booking for "${booking.event.title}" has been rejected.`,
      relatedEvent: booking.event._id,
      relatedBooking: booking._id
    });

    const updatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('event', 'title date time location price');

    res.json({
      message: 'Booking rejected successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/event/:eventId
// @desc    Get bookings for a specific event
// @access  Private
router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      event: req.params.eventId,
      user: req.user._id // Users can only see their own bookings for an event
    })
      .populate('event', 'title date time location price')
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get event bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/pending
// @desc    Get pending bookings (Admin only)
// @access  Private (Admin)
router.get('/pending', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('event', 'title date time location price maxAttendees currentAttendees')
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get pending bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
