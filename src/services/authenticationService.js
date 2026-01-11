import API from "@/config/api";

export const sendOtpCreateUser = async ({ email, password }) => {
    const response = await API.post('/auth/register', { email, password }, {
        requiresAuth: false
    });
    return response.data;
};

export const verifyAndCreateUser = async ({ email, password, otp }) => {
    const response = await API.post('/auth/register/verify-otp', { email, password, otp }, {
        requiresAuth: false
    });
    return response.data;
};

export const authenticate = async ({ email, password }) => {
    const response = await API.post('/auth/login', { email, password }, {
        requiresAuth: false
    });
    return response.data;
};
