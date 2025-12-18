const { Router } = require('express');
const { generateChatResponse } = require('../controllers/ai.controller');

const router = Router();

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Generate AI chat response
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: What services do you offer?
 *               conversationHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI response generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 response:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       500:
 *         description: AI service error
 */
router.post('/chat', generateChatResponse);

module.exports = router;