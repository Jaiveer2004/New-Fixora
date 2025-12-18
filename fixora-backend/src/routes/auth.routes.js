// This file defines the API endpoints (/register and /login) and connects them to the controller functions.
const { Router } = require('express');
const {
  registerUser,
  loginUser,
  googleAuthCallback,
  verifyEmail,
  resendVerificationEmail
} = require('../controllers/auth.controller');

const { authLimiter } = require('../middlewares/rateLimit.middleware');

const passport = require('../config/passport');

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *               role:
 *                 type: string
 *                 enum: [customer, partner]
 *                 default: customer
 *                 example: customer
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully! Please verify your email.
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful or 2FA required
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Login Successful
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 2FA verification required
 *                     requires2FA:
 *                       type: boolean
 *                       example: true
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 *       423:
 *         description: Account locked
 */
router.post('/login', authLimiter, loginUser);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify email address
 *     description: Verify user email with token and code
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               token:
 *                 type: string
 *                 example: abc123def456
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired verification code
 */
router.post('/verify-email', verifyEmail);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend verification email
 *     description: Resend email verification code to user
 *     security: []
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
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Verification email sent
 *       404:
 *         description: User not found
 */
router.post('/resend-verification', resendVerificationEmail);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  googleAuthCallback
);

module.exports = router;