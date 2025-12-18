// Import crypto module for hashing, encryption, and secure random generation
const nodeCrypto = require('crypto');

// Import bcrypt for secure one-way hashing
const bcrypt = require('bcryptjs');

// ========================================
// HASHING FUNCTIONS (One-Way)
// ========================================

// Hash data using bcrypt (ideal for OTPs and backup codes that need comparison)
const hashWithBcrypt = async (data) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(data.toString(), salt);
}

// Compare plain data with a bcrypt hash and return whether it matches
const compareBcrypt = async (data, hash) => {
  return await bcrypt.compare(data.toString(), hash);
}

// Hash data using SHA-256 (ideal for tokens, faster than bcrypt)
const hashWithSHA256 = (data) => {
  return nodeCrypto
    .createHash('sha256')
    .update(data.toString())
    .digest('hex');
};

// Hash data using HMAC-SHA256 with a secret key (most secure for tokens)
const hashWithHMAC = (data) => {
  const secret = process.env.JWT_SECRET || "you-re-an-a.Good";
  return nodeCrypto
    .createHmac('sha256', secret)
    .update(data.toString())
    .digest('hex');
}

// ========================================
// ENCRYPTION FUNCTIONS (Two-Way)
// ========================================

// Retrieve AES-256 encryption key (must be 32 bytes = 64 hex chars)
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  
  // Key should be 64 hex characters (32 bytes)
  if (!key || key.length !== 64) {
    console.error('❌ ENCRYPTION_KEY not set or invalid length. Expected 64 hex chars, got:', key?.length);
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }

  // Convert hex string to Buffer
  return Buffer.from(key, 'hex');
}

// Encrypt data using AES-256-GCM, returning iv, authTag, and encrypted text combined
const encrypt = (data) => {
  try {
    const key = getEncryptionKey();
    const iv = nodeCrypto.randomBytes(16);

    const cipher = nodeCrypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(data.toString(), 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
}

// Decrypt AES-256-GCM encrypted data by splitting iv, authTag, and ciphertext
const decrypt = (encryptedData) => {
  try {
    if (!encryptedData) {
      throw new Error('No encrypted data provided');
    }

    const key = getEncryptionKey();
    const parts = String(encryptedData).split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = nodeCrypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw error;
  }
}

// ========================================
// RANDOM GENERATION
// ========================================

// Generate a cryptographically secure random hex string
const generateSecureRandom = (length = 32) => {
  return nodeCrypto.randomBytes(length).toString('hex');
};

// Generate a random numeric OTP of specified length
const generateNumericOTP = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};


// ========================================
// TIMING-SAFE COMPARISON
// ========================================

// Compare two strings using constant-time comparison to prevent timing attacks
const timingSafeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  
  if (bufferA.length !== bufferB.length) {
    return false;
  }
  
  return nodeCrypto.timingSafeEqual(bufferA, bufferB);
};

module.exports = {
  // Hashing
  hashWithBcrypt,
  compareBcrypt,
  hashWithSHA256,
  hashWithHMAC,
  
  // Encryption
  encrypt,
  decrypt,
  
  // Random generation
  generateSecureRandom,
  generateNumericOTP,
  
  // Security
  timingSafeCompare,
};