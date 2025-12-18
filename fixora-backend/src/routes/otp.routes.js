const { Router } = require('express');
const { requestLoginOTP, verifyLoginOTP } = require('../controllers/otp.controller');
const { otpLimiter, verificationLimiter } = require('../middlewares/rateLimit.middleware');

const router = Router();

/**
 * @swagger
 * /otp/request-login:
 *   post:
 *     summary: Request OTP for passwordless login
 *     description: |
 *       Initiates passwordless login by sending a One-Time Password to user's email.
 *       Provides an alternative to traditional password-based authentication.
 *       
 *       **OTP Features:**
 *       - Generates 6-digit numeric OTP using crypto-random library
 *       - Valid for 10 minutes from generation time
 *       - Hashed with SHA-256 before database storage
 *       - Rate limited to prevent OTP flooding (3 requests per 15 min)
 *       - Email includes device info and IP for security
 *       
 *       **Security Implementation:**
 *       - OTP stored as SHA-256 hash (not plain text)
 *       - Includes generation timestamp for expiry validation
 *       - Records IP address and user-agent for tracking
 *       - Auto-deletes expired OTPs via TTL index
 *       - Prevents brute force with rate limiting
 *       
 *       **Email Contents:**
 *       - 6-digit OTP code prominently displayed
 *       - User's device info (Chrome on Windows, etc.)
 *       - IP address for location awareness
 *       - Expiry time (10 minutes)
 *       - Security warning if unexpected login
 *       
 *       **Use Cases:**
 *       - Quick login without remembering password
 *       - Emergency access when password forgotten
 *       - More secure than password for public computers
 *       - Temporary access for shared devices
 *       
 *       **Flow:**
 *       1. User enters email address
 *       2. System generates 6-digit OTP
 *       3. OTP sent to email with device/IP info
 *       4. User receives email within seconds
 *       5. User enters OTP on verification page
 *       6. Call POST /otp/verify-login to complete login
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Registered email address to send OTP
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully to email
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
 *                   example: OTP sent to your email. Valid for 10 minutes.
 *                 expiresIn:
 *                   type: number
 *                   description: OTP validity in seconds
 *                   example: 600
 *       400:
 *         description: Invalid email format or user not found
 *       429:
 *         description: Too many requests - Rate limit exceeded (3 per 15 minutes)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Too many OTP requests. Please try again after 15 minutes.
 *       500:
 *         description: Email service error
 */
router.post('/request-login', otpLimiter, requestLoginOTP);

/**
 * @swagger
 * /otp/verify-login:
 *   post:
 *     summary: Verify OTP and login
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid OTP
 *       429:
 *         description: Too many requests
 */
router.post('/verify-login', verificationLimiter, verifyLoginOTP);

module.exports = router;