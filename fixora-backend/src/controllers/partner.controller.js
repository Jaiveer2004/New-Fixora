// This controller handles the logic for creating a partner profile. A key step here is to also update the user's role in the User model from 'customer' to 'partner'.

const ServicePartner = require('../models/servicePartner.model');
const User = require('../models/user.model');
const Service = require('../models/service.model');

// @desc    Create a service partner profile for the logged-in user
// @route   POST /api/partners
// @access  Private
const createPartnerProfile = async (req, res) => {
  try {
    // The user ID comes from the 'protect' middleware:
    const userId = req.user._id;

    // 1. Check if the partner profile already exists for this user:
    const existingProfile = await ServicePartner.findOne({ user: userId });
    if (existingProfile) {
      return res.status(400).json({ message: 'Service partner profile already exists.' });
    }

    // 2. Create the new service partner profile
    const { 
      bio, 
      skillsAndExpertise, 
      experienceYears, 
      phoneNumber, 
      serviceAreas, 
      priceRange, 
      availability 
    } = req.body;
    
    const partnerProfile = await ServicePartner.create({
      user: userId,
      bio,
      skillsAndExpertise,
      experienceYears,
      phoneNumber,
      serviceAreas,
      priceRange,
      availability
    });

    // 3. Update the user's profile role to 'partner'
    await User.findByIdAndUpdate(userId, { role: 'partner' });

    res.status(201).json({
      message: 'Partner profile created successfully. You can now start offering services!',
      profile: partnerProfile,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// @desc    Get all services for the logged-in partner
// @route   GET /api/partners/services
// @access  Private (Partners only)

const getPartnerServices = async (req, res) => {
  try {
    const partnerProfile = await ServicePartner.findOne({user: req.user._id});
    if (!partnerProfile) {
      return res.status(404).json({message: 'Partner profile not found'});
    }

    const services = await Service.find({partner: partnerProfile._id});
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// @desc    Update a partner's online status
// @route   PATCH /api/partners/status
// @access  Private (Partners only)

const updatePartnerStatus = async (req, res) => {
  try {
    if (req.user.role !== 'partner') {
        return res.status(403).json({ message: "Forbidden: Only partners can change status" });
    }

    const partnerProfile = await ServicePartner.findOne({ user: req.user._id });
    if (!partnerProfile) {
        return res.status(404).json({ message: "Partner profile not found" });
    }

    // Get the new status from the request body
    const { isOnline } = req.body;
    
    partnerProfile.isOnline = isOnline;
    await partnerProfile.save();

    res.status(200).json({ 
        message: `Status updated to ${isOnline ? 'Online' : 'Offline'}`,
        isOnline: partnerProfile.isOnline,
    });

  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get the current partner's profile
// @route   GET /api/partners/me
// @access  Private (Partners only)

const getMyPartnerProfile = async (req, res) => {
    try {
        const partnerProfile = await ServicePartner.findOne({ user: req.user._id });
        if (!partnerProfile) {
            return res.status(404).json({ message: "Partner profile not found" });
        }
        res.status(200).json(partnerProfile);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createPartnerProfile, getPartnerServices, updatePartnerStatus, getMyPartnerProfile };