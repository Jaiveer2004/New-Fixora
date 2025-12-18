// This controller will handle the logic for creating a new service. We'll add an important authorization check to ensure the user is a partner and find their corresponding ServicePartner profile.

const Service = require('../models/service.model');
const ServicePartner = require('../models/servicePartner.model');
const Review = require('../models/review.model');
const Booking = require('../models/booking.model');

// @desc    Create a new service offering
// @route   POST /api/services
// @access  Private (Partners only)
const createService = async (req, res) => {
  try {
    // 1. Autorization: Check if the user is a partner

    if (req.user.role != 'partner') {
      return res.status(403).json({ message: 'Forbidden: Only partners can create service' });
    }

    const partnerProfile = await ServicePartner.findOne({ user: req.user._id });
    if (!partnerProfile) {
      return res.status(404).json({ message: 'Service partner profile not found ' });
    }

    // 3. Extract service data from request body:
    const { name, description, category, price, priceType, duration } = req.body;

    // 4. Create and save the new service
    const service = await Service.create({
      partner: partnerProfile._id,
      name,
      description,
      category,
      price,
      priceType,
      duration,
    });

    res.status(201).json({
      message: 'Service created successfully',
      service,
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// @desc    Get all active services grouped by name (no duplicates)
// @route   GET /api/services
// @access  Public


const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .populate({
        path: 'partner',
        select: 'user bio averageRating',
        populate: {
          path: 'user',
          select: 'fullName profilePicture'
        }
      });

    // Group services by name and get the best representative for each
    const serviceMap = new Map();
    
    for (const service of services) {
      const serviceName = service.name;
      
      if (!serviceMap.has(serviceName)) {
        // Get review counts for this service
        const reviewCount = await Review.countDocuments({ partner: service.partner._id });
        const reviews = await Review.find({ partner: service.partner._id }).select('rating');
        
        let averageRating = 0;
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          averageRating = (totalRating / reviews.length).toFixed(1);
        }

        // Count total providers for this service
        const providerCount = await Service.countDocuments({ 
          name: serviceName, 
          isActive: true 
        });

        serviceMap.set(serviceName, {
          _id: service._id,
          name: service.name,
          description: service.description,
          category: service.category,
          price: service.price,
          duration: service.duration,
          providerCount,
          reviewCount,
          averageRating: parseFloat(averageRating) || service.partner.averageRating || 0,
          // Use the first service as representative
          sampleProvider: {
            name: service.partner.user.fullName,
            rating: parseFloat(averageRating) || service.partner.averageRating || 0
          }
        });
      }
    }

    const uniqueServices = Array.from(serviceMap.values());
    res.status(200).json(uniqueServices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get available providers for a specific service
// @route   GET /api/services/:serviceName/providers
// @access  Public


const getServiceProviders = async (req, res) => {
  try {
    const { serviceName } = req.params;
    
    // Find all services with this name
    const services = await Service.find({ 
      name: serviceName, 
      isActive: true 
    }).populate({
      path: 'partner',
      select: 'user bio averageRating isOnline',
      populate: {
        path: 'user',
        select: 'fullName profilePicture email phone'
      }
    });

    if (services.length === 0) {
      return res.status(404).json({ message: 'No providers found for this service' });
    }

    // Get provider details with availability
    const providersWithAvailability = await Promise.all(
      services.map(async (service) => {
        const partner = service.partner;
        
        // Get reviews for this partner
        const reviews = await Review.find({ partner: partner._id })
          .populate('customer', 'fullName')
          .sort({ createdAt: -1 })
          .limit(5);

        const reviewCount = await Review.countDocuments({ partner: partner._id });
        
        let averageRating = 0;
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          averageRating = (totalRating / reviews.length).toFixed(1);
        }

        // Check current bookings for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayBookings = await Booking.find({
          serviceId: service._id,
          bookingDate: {
            $gte: today,
            $lt: tomorrow
          },
          status: { $in: ['pending', 'confirmed', 'in-progress'] }
        }).select('bookingDate status');

        // Calculate availability
        const isAvailable = partner.isOnline && todayBookings.length < 3; // Max 3 bookings per day
        const nextAvailableSlot = isAvailable ? 'Available now' : 'Tomorrow';

        return {
          serviceId: service._id,
          serviceName: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          provider: {
            id: partner._id,
            name: partner.user.fullName,
            profilePicture: partner.user.profilePicture,
            bio: partner.bio,
            email: partner.user.email,
            phone: partner.user.phone,
            isOnline: partner.isOnline || false,
            averageRating: parseFloat(averageRating) || partner.averageRating || 0,
            reviewCount,
            totalBookingsToday: todayBookings.length,
            isAvailable,
            nextAvailableSlot,
            recentReviews: reviews.slice(0, 3)
          }
        };
      })
    );

    // Sort by availability first, then by rating
    providersWithAvailability.sort((a, b) => {
      if (a.provider.isAvailable !== b.provider.isAvailable) {
        return b.provider.isAvailable ? 1 : -1;
      }
      return b.provider.averageRating - a.provider.averageRating;
    });

    res.status(200).json({
      serviceName,
      totalProviders: providersWithAvailability.length,
      availableProviders: providersWithAvailability.filter(p => p.provider.isAvailable).length,
      providers: providersWithAvailability
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single service by ID with reviews
// @route   GET /api/services/:id
// @access  Public

const getServiceById = async (req, res) => {
  try {
    console.log('Fetching service with ID:', req.params.id);
    
    const service = await Service.findById(req.params.id)
      .populate({
        path: 'partner',
        select: 'user bio averageRating',
        populate: {
          path: 'user',
          select: 'fullName profilePicture'
        }
      });

    if (!service) {
      console.log('Service not found for ID:', req.params.id);
      return res.status(404).json({message: 'Service not found'});
    }

    console.log('Service found:', service.name);

    // Get reviews for this service's partner
    const reviews = await Review.find({ partner: service.partner._id })
      .populate('customer', 'fullName')
      .sort({ createdAt: -1 })
      .limit(10);

    const reviewCount = await Review.countDocuments({ partner: service.partner._id });
    
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = (totalRating / reviews.length).toFixed(1);
    }

    const serviceWithReviews = {
      ...service.toObject(),
      reviews,
      reviewCount,
      averageRating: parseFloat(averageRating) || service.partner.averageRating || 0
    };

    console.log('Service data prepared successfully');
    res.status(200).json(serviceWithReviews);
  } catch (error) {
    console.error('Error in getServiceById:', error);
    res.status(500).json({message: 'Server error', error: error.message});
  }
};

module.exports = { createService, getAllServices, getServiceProviders, getServiceById };