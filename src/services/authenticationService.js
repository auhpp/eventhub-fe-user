import API from "@/config/api";

export const sendOtpCreateUser = async ({ email, password }) => {
    const response = await API.post('/api/v1/auth/register', { email, password }, {
        requiresAuth: false
    });
    return response.data;
};

export const verifyAndCreateUser = async ({ email, password, otp }) => {
    const response = await API.post('/api/v1/auth/register/verify-otp', { email, password, otp }, {
        requiresAuth: false
    });
    return response.data;
};

export const authenticate = async ({ email, password }) => {
    const response = await API.post('/api/v1/auth/login', { email, password }, {
        requiresAuth: false
    });
    return response.data;
};

export const getCurrentUserInfo = async () => {
    const response = await API.get('/api/v1/auth/current-user', {
        requiresAuth: true
    });
    return response.data;
};

export const logout = async () => {
    const response = await API.post('/api/v1/auth/logout', {
        requiresAuth: false
    });
    return response.data;
};
