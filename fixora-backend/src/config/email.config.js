const nodemailer = require('nodemailer');

// Create reusable transpoter
const createTransporter = () => {
  return nodemailer.createTransport({
    service:'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

const transporter = createTransporter();

transporter.verify((error, success) => {
  if (error) {
    console.error('Email service configuration error:', error);
  } else {
    console.log('Email Service is ready');
  }
});

module.exports = transporter;