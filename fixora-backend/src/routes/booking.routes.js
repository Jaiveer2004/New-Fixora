const { Router } = require('express');
const { createBooking, createPaymentOrder, getMyBookings, verifyPayment, cancelBooking, confirmBooking, rejectBooking, updateBookingStatus } = require('../controllers/booking.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new service booking
 *     description: |
 *       Creates a new booking for a service with a specific partner. This is the first step
 *       in the booking flow, after which payment must be completed to confirm the booking.
 *       
 *       **Booking Process:**
 *       1. Customer selects a service and partner
 *       2. System validates service exists and partner is available
 *       3. Creates booking record in 'pending' status
 *       4. Calculates total price from service pricing
 *       5. Creates Razorpay order for payment
 *       6. Returns booking details with Razorpay order ID
 *       
 *       **What Happens After:**
 *       - Frontend initiates Razorpay payment with order ID
 *       - Customer completes payment on Razorpay
 *       - Call /bookings/verify-payment to confirm transaction
 *       - Booking status updates to 'confirmed' after payment
 *       - Partner receives notification of new booking
 *       
 *       **Business Rules:**
 *       - User must be authenticated (JWT required)
 *       - Service and partner must exist in database
 *       - Partner must have 'approved' status
 *       - Address must include street, city, postal code
 *       - Scheduled date must be in the future
 *       - Prevents double booking for same time slot
 *     tags: [Bookings]
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
 *               - partnerId
 *               - scheduledDate
 *               - address
 *             properties:
 *               serviceId:
 *                 type: string
 *                 description: MongoDB ObjectId of the service being booked
 *                 example: 507f1f77bcf86cd799439011
 *               partnerId:
 *                 type: string
 *                 description: MongoDB ObjectId of the service partner
 *                 example: 507f1f77bcf86cd799439012
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *                 description: Preferred date and time for service (ISO 8601 format)
 *                 example: 2024-12-25T10:00:00Z
 *               address:
 *                 type: object
 *                 description: Service location address
 *                 required:
 *                   - street
 *                   - city
 *                   - postalCode
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: 123 Main Street, Apt 4B
 *                   city:
 *                     type: string
 *                     example: Mumbai
 *                   state:
 *                     type: string
 *                     example: Maharashtra
 *                   postalCode:
 *                     type: string
 *                     example: 400001
 *               notes:
 *                 type: string
 *                 description: Additional instructions or requirements for the service
 *                 example: Please bring spare parts. Access code is 1234.
 *     responses:
 *       201:
 *         description: Booking created successfully with Razorpay order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *                 razorpayOrder:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Razorpay order ID for payment
 *                       example: order_MNop1234567890
 *                     amount:
 *                       type: number
 *                       description: Amount in smallest currency unit (paise for INR)
 *                       example: 50000
 *                     currency:
 *                       type: string
 *                       example: INR
 *       400:
 *         description: Invalid input - Missing fields or invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *       404:
 *         description: Service or partner not found
 */
router.post('/', protect, createBooking);

/**
 * @swagger
 * /bookings/verify-payment:
 *   post:
 *     summary: Verify Razorpay payment signature and confirm booking
 *     description: |
 *       Critical endpoint that verifies payment authenticity using Razorpay's signature mechanism.
 *       Must be called after customer completes payment on Razorpay checkout to confirm booking.
 *       
 *       **Payment Verification Process:**
 *       - Uses HMAC SHA-256 to verify Razorpay signature
 *       - Validates signature = HMAC(order_id + "|" + payment_id, key_secret)
 *       - Prevents payment tampering and fraud attempts
 *       - Updates booking status only after signature verification
 *       - Records payment ID for refund/dispute handling
 *       
 *       **Security Implementation:**
 *       - Signature computed using Razorpay key secret (server-side only)
 *       - Compare computed signature with received signature
 *       - Timing-safe comparison to prevent timing attacks
 *       - Rejects any mismatch immediately
 *       - Logs verification attempts for audit trail
 *       
 *       **What Happens After Verification:**
 *       1. Signature validated against Razorpay credentials
 *       2. Booking status updated from 'pending' to 'confirmed'
 *       3. Payment status changed to 'paid'
 *       4. Partner receives notification of new booking
 *       5. Customer gets confirmation email
 *       6. Service scheduled in partner's calendar
 *       7. Chat room automatically created for customer-partner communication
 *       
 *       **Razorpay Integration:**
 *       - Frontend initiates payment with Razorpay SDK
 *       - Customer completes payment on Razorpay
 *       - Razorpay callback returns order_id, payment_id, signature
 *       - Frontend sends these to this endpoint for verification
 *       - Backend confirms with Razorpay before marking as paid
 *       
 *       **Error Scenarios:**
 *       - Invalid signature: Payment rejected, booking remains pending
 *       - Network timeout: Retry mechanism available
 *       - Duplicate verification: Handled gracefully (idempotent)
 *       - Failed payment: Booking auto-cancelled after 30 minutes
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *               - bookingId
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *                 description: Razorpay order ID from create-order response
 *                 example: order_MNop1234567890
 *               razorpay_payment_id:
 *                 type: string
 *                 description: Payment ID received from Razorpay after successful payment
 *                 example: pay_NOpq2345678901
 *               razorpay_signature:
 *                 type: string
 *                 description: HMAC signature generated by Razorpay for verification
 *                 example: 9f0e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e
 *               bookingId:
 *                 type: string
 *                 description: MongoDB ObjectId of the booking being paid for
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Payment verified successfully - Booking confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment verified and booking confirmed
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid payment signature - Payment verification failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid payment signature. Payment verification failed.
 *       404:
 *         description: Booking not found
 */
router.post('/verify-payment', protect, verifyPayment);

/**
 * @swagger
 * /bookings/create-order:
 *   post:
 *     summary: Create payment order
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - bookingId
 *             properties:
 *               amount:
 *                 type: number
 *               bookingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/create-order', protect, createPaymentOrder);

/**
 * @swagger
 * /bookings/my-bookings:
 *   get:
 *     summary: Get user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, in-progress, completed, cancelled]
 *         description: Filter by booking status
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 */
router.get('/my-bookings', protect, getMyBookings);

/**
 * @swagger
 * /bookings/{bookingId}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       404:
 *         description: Booking not found
 */
router.patch('/:bookingId/cancel', protect, cancelBooking);

/**
 * @swagger
 * /bookings/{bookingId}/confirm:
 *   patch:
 *     summary: Confirm a booking (partner only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking confirmed successfully
 *       403:
 *         description: Forbidden
 */
router.patch('/:bookingId/confirm', protect, confirmBooking);

/**
 * @swagger
 * /bookings/{bookingId}/reject:
 *   patch:
 *     summary: Reject a booking (partner only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking rejected successfully
 *       403:
 *         description: Forbidden
 */
router.patch('/:bookingId/reject', protect, rejectBooking);

/**
 * @swagger
 * /bookings/{bookingId}/status:
 *   patch:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [in-progress, completed]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status
 */
router.patch('/:bookingId/status', protect, updateBookingStatus);

module.exports = router;