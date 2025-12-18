// This schema defines a specific service offered by a partner. It includes details like the category, price, and a reference to the partner providing it.

const { Schema, model } = require('mongoose');

const serviceSchema = new Schema({
  
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'ServicePartner',
    required: true,
  },

  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
  },

  description: {
    type: String,
    required: [true, 'Description is required'],
  },

  category: {
    type: String,
    required: [true, 'Category is required'],
    // Example categories: 'Plumbing', 'Cleaning', 'Electrical', 'Tutoring'
  },

  price: {
    type: Number,
    required: [true, 'Price is required'],
  },

  priceType: {
    type: String,
    enum: ['fixed', 'hourly'],
    default: 'fixed',
  },

  duration: {
    type: Number,
    required: [true, 'Service duration is required'],
    min: [15, 'Minimum service duration is 15 minutes'],
    max: [480, 'Maximum service duration is 8 hours (480 minutes)'],
    // Duration in minutes (e.g., 60 for 1 hour, 120 for 2 hours)
  },

  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

const Service = model('Service', serviceSchema);
module.exports = Service;