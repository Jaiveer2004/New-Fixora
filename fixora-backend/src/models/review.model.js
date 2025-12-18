const { Schema, model } = require('mongoose');
const ServicePartner = require('./servicePartner.model');

const reviewSchema = new Schema({
  booking: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
    },
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
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        trim: true,
    },
}, {timestamps: true});

reviewSchema.post('save', async function() {
  const partnerId = this.partner;

  // 1. Find all reviews for this partner
  const reviews = await this.constructor.find({partner: partnerId});

  // 2.Calculate the new average rating
  const totalRatings = reviews.reduce((acc, item) => acc + item.rating, 0);
  const averageRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(2) : 0;

  // 3. Update the ServicePartner document
  await ServicePartner.findByIdAndUpdate(partnerId, {averageRating: averageRating});
});

const Review = model('Review', reviewSchema);
module.exports = Review;