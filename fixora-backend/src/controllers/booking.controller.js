// This is a controller to handle the logic for creating and managing bookings. The createBooking function will be protected, ensuring only logged-in users can make a booking.

const Booking = require('../models/booking.model');
const Service = require('../models/service.model');
const ServicePartner = require('../models/servicePartner.model');
const User = require('../models/user.model');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Customers only)
const createBooking = async (req, res) => {
  try {
    const { serviceId, bookingDate, address } = req.body;
    const customerId = req.user._id;

    // 1. Find the service to be booked
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ message: 'Service not found or is unavailable' });
    }

    // 2. Create the new booking
    const booking = await Booking.create({
      customer: customerId,
      partner: service.partner,
      service: serviceId,
      bookingDate,
      address,
      totalPrice: service.price,
    });

    const razorpay = getRazorpayInstance();

    // 3. Create an order with razorpay
    const options = {
      amount: service.price * 100,
      currency: "INR",
      receipt: booking._id.toString(),
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: "Failed to create Razorpay order" });
    }

    // 4. Send the booking and order details back to frontend
    res.status(201).json({
      message: 'Booking created successfully. Please complete payment.',
      booking,
      order,
    });

  } catch (error) {
    console.log('Booking creation failed: ', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// @desc    Create a Razorpay payment order
// @route   POST /api/bookings/create-order
// @access  Private


const createPaymentOrder = async (req, res) => {
  try {
    const { serviceId } = req.body;

    // Find the service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found!' });
    }

    // Initialize Razorpay instance
    const razorpay = getRazorpayInstance();

    const options = {
      amount: service.price * 100,
      currency: "INR",
      receipt: `receipt_booking_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);

  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify Razorpay payment AND create the booking
// @route   POST /api/bookings/verify-payment
// @access  Private


const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingDetails
    } = req.body;

    // Add validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingDetails) {
      return res.status(400).json({ message: 'Missing required payment verification data' });
    }

    // 1. Create the signature string
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    // 2. Generate the expected signature using your key secret
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    // 3. Compare the signatures
    if (expectedSignature === razorpay_signature) {
      // Signature is valid, payment is authentic
      const service = await Service.findById(bookingDetails.serviceId);

      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }

      const bookingStartTime = new Date(bookingDetails.bookingDate);

      // Calculate booking end time (duration is in minutes, convert to milliseconds)
      const bookingEndTime = new Date(bookingStartTime.getTime() + service.duration * 60000);

      // Check for time slot conflicts with existing bookings for this partner
      // Get all active bookings for this partner on the same day
      const startOfDay = new Date(bookingStartTime);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(bookingStartTime);
      endOfDay.setHours(23, 59, 59, 999);

      const existingBookings = await Booking.find({
        partner: service.partner,
        status: { $in: ['pending', 'confirmed'] },
        bookingDate: { $gte: startOfDay, $lte: endOfDay }
      }).populate('service', 'duration');

      // Check for conflicts
      const hasConflict = existingBookings.some(booking => {
        const existingStart = new Date(booking.bookingDate);
        const existingEnd = new Date(existingStart.getTime() + booking.service.duration * 60000);
        
        // Check if there's any overlap
        return (bookingStartTime < existingEnd && bookingEndTime > existingStart);
      });

      if (hasConflict) {
        return res.status(409).json({ message: "This time slot is no longer available. Please choose another time." });
      }

      const booking = await Booking.create({
        customer: req.user._id,
        partner: service.partner,
        service: bookingDetails.serviceId,
        bookingDate: new Date(bookingDetails.bookingDate),
        address: bookingDetails.address,
        totalPrice: service.price,
        paymentStatus: 'paid',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });

      res.status(201).json({
        message: "Payment verified and booking created successfully",
        booking
      });
    } else {
      res.status(400).json({ message: "Payment verification failed: Invalid signature" });
    }

  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Get all bookings for the logged-in user
// @route   GET /api/bookings/my-bookings
// @access  Private


const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let query = {};
    let populateOptions = [];

    if (userRole === 'customer') {
      query = { customer: userId };
      populateOptions = [
        { path: 'service', select: 'name' },
        { 
          path: 'partner', 
          populate: { 
            path: 'user', 
            select: 'fullName profilePicture' 
          },
          select: 'averageRating'
        }
      ];
    } else if (userRole === 'partner') {
      // Find partner profile first
      const partner = await ServicePartner.findOne({ user: userId });
      if (partner) {
        query = { partner: partner._id };
        populateOptions = [
          { path: 'service', select: 'name' },
          { path: 'customer', select: 'fullName email' }
        ];
      } else {
        return res.status(200).json([]);
      }
    }

    const bookings = await Booking.find(query)
      .populate(populateOptions)
      .sort({ bookingDate: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:bookingId/cancel
// @access  Private


const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.customer.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ 
        message: `Cannot cancel a ${booking.status} booking` 
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Confirm a booking (Partner only)
// @route   PATCH /api/bookings/:bookingId/confirm
// @access  Private (Partners only)


const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    // Find the partner profile
    const partner = await ServicePartner.findOne({ user: userId });
    if (!partner) {
      return res.status(403).json({ message: 'Only partners can confirm bookings' });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate('customer', 'fullName email')
      .populate('service', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if partner owns this booking
    if (booking.partner.toString() !== partner._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to confirm this booking' });
    }

    // Check if booking can be confirmed
    if (booking.status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot confirm a ${booking.status} booking` 
      });
    }

    // Update booking status
    booking.status = 'confirmed';
    await booking.save();

    res.status(200).json({
      message: 'Booking confirmed successfully',
      booking
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Reject a booking (Partner only)
// @route   PATCH /api/bookings/:bookingId/reject
// @access  Private (Partners only)


const rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    // Find the partner profile
    const partner = await ServicePartner.findOne({ user: userId });
    if (!partner) {
      return res.status(403).json({ message: 'Only partners can reject bookings' });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate('customer', 'fullName email')
      .populate('service', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if partner owns this booking
    if (booking.partner.toString() !== partner._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this booking' });
    }

    // Check if booking can be rejected
    if (booking.status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot reject a ${booking.status} booking` 
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    if (reason) {
      booking.rejectionReason = reason;
    }
    await booking.save();

    res.status(200).json({
      message: 'Booking rejected successfully',
      booking
    });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}

// @desc    Update booking status (Partner only)
// @route   PATCH /api/bookings/:bookingId/status
// @access  Private (Partners only)


const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Find the partner profile
    const partner = await ServicePartner.findOne({ user: userId });
    if (!partner) {
      return res.status(403).json({ message: 'Only partners can update booking status' });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate('customer', 'fullName email')
      .populate('service', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if partner owns this booking
    if (booking.partner.toString() !== partner._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Update booking status
    booking.status = status;
    await booking.save();

    res.status(200).json({
      message: `Booking status updated to ${status} successfully`,
      booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}

module.exports = { 
  createBooking, 
  createPaymentOrder, 
  verifyPayment, 
  getMyBookings, 
  cancelBooking, 
  confirmBooking, 
  rejectBooking, 
  updateBookingStatus 
};