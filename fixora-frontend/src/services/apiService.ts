import api from '@/lib/api';

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

interface PartnerProfileData {
    bio: string;
    skillsAndExpertise: string[];
    [key: string]: unknown;
}

interface ServiceData {
    name: string;
    description: string;
    category: string;
    price: number;
    duration: number;
    isActive?: boolean;
    [key: string]: unknown;
}

interface BookingData {
    serviceId: string;
    bookingDate: string;
    address: {
        street: string;
        city: string;
        postalCode: string;
    };
    [key: string]: unknown;
}

interface PaymentData {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    bookingDetails: BookingData;
    [key: string]: unknown;
}

interface ReviewData {
    bookingId: string;
    rating: number;
    comment: string;
    [key: string]: unknown;
}

interface UserProfileData {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    [key: string]: unknown;
}

interface StatusUpdate {
    isOnline: boolean;
}

// --- Auth Service ---
export const loginUser = (credentials: LoginCredentials) => {
    return api.post('/auth/login', credentials);
};

export const registerUser = (userData: RegisterData) => {
    return api.post('/auth/register', userData);
};

// --- Partner Service ---
export const createPartnerProfile = (profileData: PartnerProfileData) => {
    return api.post('/partners', profileData);
};

export const getPartnerProfile = () => {
    return api.get('/partners/me');
};

export const updatePartnerStatus = (status: StatusUpdate) => {
    return api.patch('/partners/status', status);
};

export const getPartnerServices = () => {
    return api.get('/partners/services');
};

// --- Service Service ---
export const createService = (serviceData: ServiceData) => {
    return api.post('/services', serviceData);
};

export const getAllServices = () => {
    return api.get('/services');
};

export const getServiceById = (serviceId: string) => {
    return api.get(`/services/${serviceId}`);
};

export const getServiceProviders = (serviceName: string) => {
    return api.get(`/services/${encodeURIComponent(serviceName)}/providers`);
};

export const updateService = (serviceId: string, serviceData: Partial<ServiceData>) => {
    return api.put(`/services/${serviceId}`, serviceData);
};

export const deleteService = (serviceId: string) => {
    return api.delete(`/services/${serviceId}`);
};

// --- Booking Service ---
export const createBooking = (bookingData: BookingData) => {
    return api.post('/bookings', bookingData);
};

export const createPaymentOrder = (serviceId: string) => {
    return api.post('/bookings/create-order', { serviceId });
};

export const verifyPayment = (paymentData: PaymentData) => {
    return api.post('/bookings/verify-payment', paymentData);
};

export const getUserBookings = () => {
    return api.get('/bookings/my-bookings');
};

export const cancelBooking = (bookingId: string) => {
    return api.patch(`/bookings/${bookingId}/cancel`);
};

export const confirmBooking = (bookingId: string) => {
    return api.patch(`/bookings/${bookingId}/confirm`);
};

export const rejectBooking = (bookingId: string, reason?: string) => {
    return api.patch(`/bookings/${bookingId}/reject`, { reason });
};

export const updateBookingStatus = (bookingId: string, status: string) => {
    return api.patch(`/bookings/${bookingId}/status`, { status });
};

// --- Review Service ---
export const createReview = (reviewData: ReviewData) => {
    return api.post('/reviews', reviewData);
};

export const getServiceReviews = (serviceId: string) => {
    return api.get(`/reviews/service/${serviceId}`);
};

// --- User Service ---
export const getUserProfile = () => {
    return api.get('/users/profile');
};

export const updateUserProfile = (userData: UserProfileData) => {
    return api.put('/users/profile', userData);
};

export const getDashboardStats = () => {
    return api.get('/users/dashboard-stats');
};

// --- AI Service ---
export const getChatResponse = (message: string) => {
    return api.post('/ai/chat', { message });
};
