// This schema represents an appointment, connecting a customer, a partner, and a specific service. It tracks the status, date, and location of the job.

const { Schema, model } = require('mongoose');

const bookingSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'ServicePartner',
    required: true,
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: false }, // Made optional
    postalCode: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  rejectionReason: {
    type: String,
  },
  notes: {
    type: String,
  }
}, { timestamps: true });

const Booking = model('Booking', bookingSchema);
module.exports = Booking;