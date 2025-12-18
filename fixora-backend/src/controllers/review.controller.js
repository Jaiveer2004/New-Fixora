const Review = require('../models/review.model');
const Booking = require('../models/booking.model');

// @desc    Create a new review for a booking
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const customerId = req.user._id;

    // 1. Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({message: "Booking not found"});
    }

    // 2. Validate the booking
    if (booking.customer.toString() !== customerId.toString()) {
      return res.status(403).json({ message: "You can only review your own bookings" });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: "You can only review completed bookings" });
    }

    // 3. Check if a review already exists for this booking
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this booking" });
    }

    // 4. Create and save the new review
    const review = await Review.create({
        booking: bookingId,
        customer: customerId,
        partner: booking.partner,
        rating,
        comment,
    });

    res.status(201).json({message: "Review submitted successfully", review});

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

module.exports = { createReview };