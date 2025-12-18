import api from '@/lib/api';

// ========================================
// TYPES & INTERFACES
// ========================================

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    fullName: string;
    email: string;
    password: string;
    role?: string;
}

interface OTPLoginData {
    email: string;
}

interface OTPVerifyData {
    email: string;
    otp: string;
}

interface EmailVerifyData {
    token: string;
    code: string;
}

interface ResendVerificationData {
    email: string;
}

interface TwoFactorEnableData {
    userId: string;
}

interface TwoFactorVerifyData {
    token: string;
}

interface TwoFactorLoginData {
    email: string;
    token: string;
}

interface TwoFactorDisableData {
    password: string;
}

interface BackupCodeVerifyData {
    email: string;
    backupCode: string;
}

interface PasswordResetRequestData {
    email: string;
}

interface PasswordResetData {
    token: string;
    newPassword: string;
}

// ========================================
// AUTH SERVICE - Basic Authentication
// ========================================

export const loginUser = (credentials: LoginCredentials) => {
    return api.post('/auth/login', credentials);
};

export const registerUser = (userData: RegisterData) => {
    return api.post('/auth/register', userData);
};

export const logoutUser = () => {
    return api.post('/auth/logout');
};

// ========================================
// EMAIL VERIFICATION
// ========================================

export const verifyEmail = (data: EmailVerifyData) => {
    return api.post('/auth/verify-email', data);
};

export const resendVerificationEmail = (data: ResendVerificationData) => {
    return api.post('/auth/resend-verification', data);
};

// ========================================
// OTP LOGIN
// ========================================

export const requestOTPLogin = (data: OTPLoginData) => {
    return api.post('/otp/request-login', data);
};

export const verifyOTPLogin = (data: OTPVerifyData) => {
    return api.post('/otp/verify-login', data);
};

// ========================================
// TWO-FACTOR AUTHENTICATION (2FA)
// ========================================

export const enable2FA = (data: TwoFactorEnableData) => {
    return api.post('/2fa/enable', data);
};

export const verify2FA = (data: TwoFactorVerifyData) => {
    return api.post('/2fa/verify', data);
};

export const verify2FALogin = (data: TwoFactorLoginData) => {
    return api.post('/2fa/verify-login', data);
};

export const disable2FA = (data: TwoFactorDisableData) => {
    return api.post('/2fa/disable', data);
};

export const verifyBackupCode = (data: BackupCodeVerifyData) => {
    return api.post('/2fa/verify-backup-code', data);
};

// ========================================
// PASSWORD RESET
// ========================================

export const requestPasswordReset = (data: PasswordResetRequestData) => {
    return api.post('/password/request-reset', data);
};

export const resetPassword = (data: PasswordResetData) => {
    return api.post('/password/reset', data);
};

// ========================================
// GOOGLE OAUTH
// ========================================

export const getGoogleAuthURL = () => {
    return `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
};
