const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const partnerRoutes = require('./routes/partner.routes');
const serviceRoutes = require('./routes/service.routes');
const bookingRoutes = require('./routes/booking.routes');
const aiRoutes = require('./routes/ai.routes');
const reviewRoutes = require('./routes/review.routes');
const otpRoutes = require('./routes/otp.routes');
const passwordRoutes = require('./routes/password.routes');
const twoFARoutes = require('./routes/2fa.routes');
const chatRoutes = require('./routes/chat.routes')

const passport = require('./config/passport');
const { apiLimiter } = require('./middlewares/rateLimit.middleware');

const app = express();

// Middlewares:
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      touchAfter: 24 * 3600,
      crypto: {
        secret: process.env.ENCRYPTION_KEY || process.env.JWT_SECRET,
      },
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'Fixora API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// API Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Fixora API',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    endpoints: {
      auth: '/api/auth',
      services: '/api/services',
      bookings: '/api/bookings',
      users: '/api/users',
      partners: '/api/partners',
      reviews: '/api/reviews',
      chat: '/api/chat',
    }
  });
});

// Routes:
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/2fa', twoFARoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/chat', chatRoutes);

module.exports = app;