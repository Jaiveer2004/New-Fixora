const { Router } = require('express');
const { createPartnerProfile, getMyPartnerProfile, getPartnerServices, updatePartnerStatus } = require('../controllers/partner.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * /partners:
 *   post:
 *     summary: Create partner profile
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - experience
 *               - expertise
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               experience:
 *                 type: number
 *               expertise:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Partner profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Partner'
 *       400:
 *         description: Invalid input
 */
router.post('/', protect, createPartnerProfile);

/**
 * @swagger
 * /partners/services:
 *   get:
 *     summary: Get partner's services
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *       401:
 *         description: Unauthorized
 */
router.get('/services', protect, getPartnerServices);

/**
 * @swagger
 * /partners/me:
 *   get:
 *     summary: Get partner profile
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Partner profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Partner'
 *       404:
 *         description: Partner profile not found
 */
router.get('/me', protect, getMyPartnerProfile);

/**
 * @swagger
 * /partners/status:
 *   patch:
 *     summary: Update partner availability status
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isAvailable
 *             properties:
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid input
 */
router.patch('/status', protect, updatePartnerStatus);

module.exports = router;