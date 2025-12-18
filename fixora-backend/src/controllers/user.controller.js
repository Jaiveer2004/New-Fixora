// An endpoint for a user to fetch their own profile.

const Booking = require('../models/booking.model');
const Service = require('../models/service.model');
const ServicePartner = require('../models/servicePartner.model');
const Review = require('../models/review.model');

const getUserProfile = async (req, res) => {
  // Because our `protect` middleware ran first, we already have the user's data in `req.user`.
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
}

// Get dashboard statistics for the logged-in user
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'customer') {
      // Customer dashboard stats
      const totalBookings = await Booking.countDocuments({ customer: userId });
      const pendingBookings = await Booking.countDocuments({ customer: userId, status: 'pending' });
      const completedBookings = await Booking.countDocuments({ customer: userId, status: 'completed' });
      const totalSpent = await Booking.aggregate([
        { $match: { customer: userId, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]);

      // Recent bookings
      const recentBookings = await Booking.find({ customer: userId })
        .populate('service', 'name')
        .populate('partner', 'user')
        .sort({ createdAt: -1 })
        .limit(5);

      stats = {
        totalBookings,
        pendingBookings,
        completedBookings,
        totalSpent: totalSpent[0]?.total || 0,
        recentBookings
      };
    } else if (userRole === 'partner') {
      // Partner dashboard stats
      const partner = await ServicePartner.findOne({ user: userId });
      if (partner) {
        const totalServices = await Service.countDocuments({ partner: partner._id });
        const activeServices = await Service.countDocuments({ partner: partner._id, isActive: true });
        const totalBookings = await Booking.countDocuments({ partner: partner._id });
        const completedBookings = await Booking.countDocuments({ partner: partner._id, status: 'completed' });
        const totalEarnings = await Booking.aggregate([
          { $match: { partner: partner._id, paymentStatus: 'paid', status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        // Recent bookings
        const recentBookings = await Booking.find({ partner: partner._id })
          .populate('service', 'name')
          .populate('customer', 'fullName email')
          .sort({ createdAt: -1 })
          .limit(5);

        // Reviews received
        const totalReviews = await Review.countDocuments({ partner: partner._id });
        const averageRating = partner.averageRating || 0;

        stats = {
          totalServices,
          activeServices,
          totalBookings,
          completedBookings,
          totalEarnings: totalEarnings[0]?.total || 0,
          totalReviews,
          averageRating,
          recentBookings,
          isOnline: partner.isOnline
        };
      } else {
        // Partner profile doesn't exist yet
        stats = {
          totalServices: 0,
          activeServices: 0,
          totalBookings: 0,
          completedBookings: 0,
          totalEarnings: 0,
          totalReviews: 0,
          averageRating: 0,
          recentBookings: [],
          isOnline: false
        };
      }
    }

    res.status(200).json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

module.exports = { getUserProfile, getDashboardStats };