const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fixora API',
      version: '1.0.0',
      description: `
# Fixora - Home Services Platform API

Welcome to the Fixora API documentation. Fixora is a comprehensive home services marketplace that connects customers with skilled service partners.

## Features

- **User Authentication**: Secure JWT-based authentication with email verification
- **Two-Factor Authentication**: TOTP-based 2FA with backup codes for enhanced security
- **Service Management**: Partners can create and manage their service offerings
- **Booking System**: Complete booking flow with Razorpay payment integration
- **Real-time Chat**: Socket.IO powered messaging between customers and partners
- **Review System**: Customer reviews and ratings for quality assurance
- **OTP Login**: Passwordless authentication option via email OTP

## Authentication

Most endpoints require authentication via JWT Bearer token. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

To obtain a token:
1. Register at \`POST /api/auth/register\`
2. Verify email at \`POST /api/auth/verify-email\`
3. Login at \`POST /api/auth/login\` to receive JWT token

## Rate Limiting

API requests are rate-limited to prevent abuse:
- General API: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes
- OTP requests: 3 requests per 15 minutes

## Error Responses

All error responses follow a consistent format:
\`\`\`json
{
  "message": "Error description",
  "error": "Detailed error information"
}
\`\`\`

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 429: Too Many Requests
- 500: Internal Server Error
      `,
      contact: {
        name: 'Fixora Team',
        email: 'support@fixora.com'
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:8000',
        description: 'Development server',
      },
      {
        url: 'https://api.fixora.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            fullName: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['customer', 'partner'], example: 'customer' },
            isEmailVerified: { type: 'boolean', example: true },
            twoFactorEnabled: { type: 'boolean', example: false },
          },
        },
        Service: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Plumbing' },
            category: { type: 'string', example: 'Home Repair' },
            description: { type: 'string', example: 'Professional plumbing services' },
            price: { type: 'number', example: 50 },
            duration: { type: 'number', example: 60 },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            service: { $ref: '#/components/schemas/Service' },
            customer: { type: 'string', example: '507f1f77bcf86cd799439011' },
            partner: { type: 'string', example: '507f1f77bcf86cd799439011' },
            scheduledDate: { type: 'string', format: 'date-time' },
            status: { 
              type: 'string', 
              enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
              example: 'pending' 
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error message' },
            error: { type: 'string', example: 'Error details' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            service: { type: 'string' },
            user: { type: 'string' },
            booking: { type: 'string' },
            rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
            comment: { type: 'string', example: 'Excellent service!' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Partner: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            fullName: { type: 'string', example: 'Jane Smith' },
            email: { type: 'string', example: 'jane@example.com' },
            phone: { type: 'string', example: '+1234567890' },
            experience: { type: 'number', example: 5 },
            expertise: { type: 'array', items: { type: 'string' }, example: ['Plumbing', 'Electrical'] },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'approved' },
            isAvailable: { type: 'boolean', example: true },
          },
        },
        DashboardStats: {
          type: 'object',
          properties: {
            totalBookings: { type: 'number', example: 15 },
            activeBookings: { type: 'number', example: 3 },
            completedBookings: { type: 'number', example: 10 },
            totalSpent: { type: 'number', example: 1500 },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
