const { Router } = require('express');
const { createService, getAllServices, getServiceById, getServiceProviders } = require('../controllers/service.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * /api/services:
 *   post:
 *     tags:
 *       - Services
 *     summary: Create a new service
 *     description: Create a new service (requires authentication)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - description
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Plumbing Service
 *               category:
 *                 type: string
 *                 example: Home Repair
 *               description:
 *                 type: string
 *                 example: Professional plumbing services for all your needs
 *               price:
 *                 type: number
 *                 example: 50
 *               duration:
 *                 type: number
 *                 example: 60
 *     responses:
 *       201:
 *         description: Service created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, createService);

/**
 * @swagger
 * /api/services:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get all services
 *     description: Retrieve a list of all available services
 *     security: []
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 */
router.get('/', getAllServices);

/**
 * @swagger
 * /api/services/{serviceName}/providers:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get service providers
 *     description: Get all providers offering a specific service
 *     security: []
 *     parameters:
 *       - in: path
 *         name: serviceName
 *         required: true
 *         schema:
 *           type: string
 *         description: The service name
 *         example: plumbing
 *     responses:
 *       200:
 *         description: List of service providers
 */
router.get('/:serviceName/providers', getServiceProviders);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get service by ID
 *     description: Retrieve a specific service by its ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The service ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Service details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 */
router.get('/:id', getServiceById);

module.exports = router;