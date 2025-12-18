const { Router } = require('express');
const { createReview } = require('../controllers/review.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - bookingId
 *               - rating
 *             properties:
 *               serviceId:
 *                 type: string
 *               bookingId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, createReview);

module.exports = router;