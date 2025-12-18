const OTP = require('../models/otp.model');
const transporter = require('../config/email.config')
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const nodeCrypto = require('crypto');

const {
  generateNumericOTP,
  hashWithBcrypt,
  compareBcrypt
} = require('./crypto.utils')

// Parse user agent to extract device info
const parseUserAgent = (userAgent) => {
  if (!userAgent || userAgent === 'Unknown Device') return 'Unknown Device';
  
  // Extract browser
  let browser = 'Unknown Browser';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edg')) browser = 'Edge';
  else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';
  
  // Extract OS
  let os = 'Unknown OS';
  if (userAgent.includes('Windows NT 10.0')) os = 'Windows 10';
  else if (userAgent.includes('Windows NT 6.3')) os = 'Windows 8.1';
  else if (userAgent.includes('Windows NT 6.2')) os = 'Windows 8';
  else if (userAgent.includes('Windows NT 6.1')) os = 'Windows 7';
  else if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS X')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
  
  return `${browser} on ${os}`;
};

// Generate OTP:
const generateOTP = (length = 6) => {
  return generateNumericOTP(length);
};

// Generate Verification Token
const generateVerificationToken = () => {
  return nodeCrypto.randomBytes(32).toString('hex');
};

// Create OTP record in database
const createOTP = async (userId, email, type, expiryMinutes = 10) => {
  try {
    const plainOTP = generateOTP(6);

    const hashOTP = await hashWithBcrypt(plainOTP);

    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Delete any existing unused OTPs for this user and type
    await OTP.deleteMany({ userId, type, isUsed: false });

    // Create new OTP:
    const otpRecord = await OTP.create({
      userId,
      email,
      otpHash: hashOTP,  // Fixed: match the model field name
      type,
      expiresAt,
    });

    return { otp: plainOTP, expiresAt, otpId: otpRecord._id };
  } catch (error) {
    console.error('Create OTP error:', error);
    throw error;
  }
};

// Verify OTP
const verifyOTP = async (email, plainOTP, type) => {
  try {
    const otpRecord = await OTP.findOne({
      email,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return { success: false, message: 'Invalid or expired OTP' };
    }

    // Check attempts
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return { success: false, message: 'Maximum OTP attempts exceeded' };
    }

    const isMatch = await compareBcrypt(plainOTP, otpRecord.otpHash);

    if (isMatch) {
      // Mark as used
      otpRecord.isUsed = true;
      await otpRecord.save();
      return {
        success: true,
        userId: otpRecord.userId,
        otpId: otpRecord._id
      };
    } else {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      return { success: false, message: 'Invalid OTP' };
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    return { success: false, message: 'Verification failed' };
  }
}

// Increment OTP attempts (now handled in verifyOTP)
const incrementOTPAttempts = async (email, plainOTP, type) => {
  // This function is now redundant but keeping for backwards compatibility
  console.log('OTP attempt tracked in verifyOTP');
};


// Load email template
const loadEmailTemplate = (templateName) => {
  const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  return handlebars.compile(templateSource);
};

// Send OTP via email
const sendOTPEmail = async (email, plainOTP, fullName, type = 'login', device = 'Unknown Device', ipAddress = 'Unknown') => {
  try {
    const template = loadEmailTemplate('otp-login');

    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

    // Parse device info
    const deviceInfo = parseUserAgent(device);
    const locationInfo = ipAddress !== 'Unknown' ? `IP: ${ipAddress}` : 'Unknown Location';

    const html = template({
      fullName,
      otp: plainOTP,
      expiryMinutes,
      timestamp: new Date().toLocaleString(),
      device: deviceInfo,
      location: locationInfo, 
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Your Fixora Login OTP - ${plainOTP}`,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send verification email
const sendVerificationEmail = async (email, verificationCode, verificationToken, fullName) => {
  try {
    const template = loadEmailTemplate('verification-email');

    const expiryHours = parseInt(process.env.EMAIL_VERIFICATION_EXPIRY_HOURS) || 24;
    const verificationLink = `${process.env.EMAIL_VERIFICATION_URL}?token=${verificationToken}&code=${verificationCode}`;

    const html = template({
      fullName,
      verificationCode,
      verificationLink,
      expiryHours,
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Fixora Account',
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  generateVerificationToken,
  createOTP,
  verifyOTP,
  incrementOTPAttempts,
  sendOTPEmail,
  sendVerificationEmail,
};