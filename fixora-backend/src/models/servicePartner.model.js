// This model holds all the professional details for a service partner and links to the core User model.

const { Schema, model } = require('mongoose');

const servicePartnerSchema = new Schema({

  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  bio: {
    type: String,
    maxLength: 500,
  },

  skillsAndExpertise: [{
    type: String, // e.g., 'plumbing', 'electrician', 'cleaning'
  }],

  experienceYears: {
    type: Number,
    min: 0,
  },

  phoneNumber: {
    type: String,
  },

  serviceAreas: [{
    type: String, // List of cities/areas they serve
  }],

  priceRange: {
    type: String,
    enum: ['budget', 'standard', 'premium'],
    default: 'standard',
  },

  availability: {
    type: String,
    enum: ['flexible', 'weekdays', 'weekends', 'evenings'],
    default: 'flexible',
  },

  portfolio: [{
      imageUrl: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
  }],

  isVerified: {
    type: Boolean,
    default: false,
  },

  isOnline: { 
    type: Boolean,
    default: false,
  },

  averageRating: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

const ServicePartner = model('ServicePartner', servicePartnerSchema);
module.exports = ServicePartner;