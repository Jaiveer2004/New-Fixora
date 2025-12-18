const { Router } = require('express');
const { getUserProfile, getDashboardStats } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', protect, getUserProfile);

/**
 * @swagger
 * /users/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard-stats', protect, getDashboardStats);

module.exports = router;