const { Router } = require('express');
const {
  enable2FA,
  verify2FA,
  disable2FA,
  verify2FALogin,
  verifyBackupCode
} = require('../controllers/2fa.controller')
const { protect } = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * /2fa/verify-login:
 *   post:
 *     summary: Verify 2FA code during login
 *     tags: [2FA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *                 description: 6-digit TOTP code
 *     responses:
 *       200:
 *         description: 2FA verified, login successful
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
 *         description: Invalid 2FA code
 */
router.post('/verify-login', verify2FALogin);

/**
 * @swagger
 * /2fa/verify-backup-code:
 *   post:
 *     summary: Verify backup code during login
 *     tags: [2FA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 description: 10-character backup code
 *     responses:
 *       200:
 *         description: Backup code verified, login successful
 *       400:
 *         description: Invalid backup code
 */
router.post('/verify-backup-code', verifyBackupCode);

// Protected routes (require authentication)
router.use(protect);

/**
 * @swagger
 * /2fa/enable:
 *   post:
 *     summary: Enable Two-Factor Authentication (2FA)
 *     description: |
 *       Initiates 2FA setup for the authenticated user. Generates a TOTP secret, QR code,
 *       and backup codes. User must scan QR code with authenticator app and verify
 *       with a 6-digit code to complete activation.
 *       
 *       **2FA Implementation Details:**
 *       - Uses Speakeasy library for TOTP (Time-based One-Time Password)
 *       - Generates 32-character base32 secret key
 *       - Compatible with Google Authenticator, Authy, Microsoft Authenticator
 *       - QR code generated using qrcode library (base64 PNG format)
 *       - Secret encrypted with AES-256-CBC before database storage
 *       - Generates 10 backup codes (8 chars each, hashed with bcrypt)
 *       
 *       **Security Measures:**
 *       - Secret key encrypted at rest in database
 *       - Backup codes hashed (not reversible)
 *       - 2FA marked as 'initiated' but not 'enabled' until verified
 *       - Each backup code can only be used once
 *       - User must verify TOTP token before 2FA becomes active
 *       
 *       **Setup Flow:**
 *       1. User requests 2FA enable (this endpoint)
 *       2. System generates secret and QR code
 *       3. User scans QR code with authenticator app
 *       4. User enters 6-digit code to verify (POST /2fa/verify)
 *       5. System validates code and activates 2FA
 *       6. User saves backup codes securely
 *       
 *       **Backup Codes Usage:**
 *       - Each code is 8 characters (alphanumeric, uppercase)
 *       - Used when authenticator app unavailable
 *       - One-time use only (marked as 'used' after consumption)
 *       - Should be stored securely offline
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup initiated successfully - Returns QR code and backup codes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 2FA setup initiated
 *                 qrCode:
 *                   type: string
 *                   description: Base64-encoded PNG QR code image (data URL format)
 *                   example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...
 *                 secret:
 *                   type: string
 *                   description: Base32 secret key for manual entry in authenticator apps
 *                   example: JBSWY3DPEHPK3PXP
 *                 backupCodes:
 *                   type: array
 *                   description: 10 one-time use backup codes for account recovery
 *                   items:
 *                     type: string
 *                     example: A1B2C3D4
 *                   example: ["A1B2C3D4", "E5F6G7H8", "I9J0K1L2", "M3N4O5P6", "Q7R8S9T0", "U1V2W3X4", "Y5Z6A7B8", "C9D0E1F2", "G3H4I5J6", "K7L8M9N0"]
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 */
router.post('/enable', enable2FA);

/**
 * @swagger
 * /2fa/verify:
 *   post:
 *     summary: Verify and activate 2FA
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit TOTP code
 *     responses:
 *       200:
 *         description: 2FA activated successfully
 *       400:
 *         description: Invalid token
 */
router.post('/verify', verify2FA);

/**
 * @swagger
 * /2fa/disable:
 *   post:
 *     summary: Disable 2FA
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       400:
 *         description: Invalid password
 */
router.post('/disable', disable2FA);

module.exports = router;