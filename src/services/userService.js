import API from "@/config/api";

export const updateInfoUser = async ({ id, formData }) => {
    const response = await API.put(`/api/v1/user/${id}`, formData, {
        requiresAuth: true,
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
    return response.data;
};

export const changePassword = async ({ id, oldPassword, newPassword }) => {
    const response = await API.put(`/api/v1/user/change-password/${id}`, { oldPassword, newPassword }, {
        requiresAuth: true,
    });
    return response.data;
};

export const getUserByEmail = async ({ email }) => {
    const response = await API.get(`/api/v1/user?email=${email}`, {
        requiresAuth: true,
    });
    return response.data;
};

export const createSocialLink = async (socialLinksArray) => {
    const response = await API.post(`/api/v1/user/social-link`, socialLinksArray, {
        requiresAuth: true,
    });
    return response.data;
};

export const updateSocialLink = async (socialLinksArray) => {
    const response = await API.put(`/api/v1/user/social-link`, socialLinksArray, {
        requiresAuth: true,
    });
    return response.data;
};

export const getUserById = async ({ id }) => {
    const response = await API.get(`/api/v1/user/${id}`, {
        requiresAuth: true,
    });
    return response.data;
};

export const sendEmailResetPassword = async ({ email }) => {
    const response = await API.post(`/api/v1/user/send-email/reset-password`, { email }, {
        requiresAuth: false,
    });
    return response.data;
};

export const resetPassword = async ({ email, newPassword, otpCode }) => {
    const response = await API.post(`/api/v1/user/reset-password`, { email, newPassword, otpCode }, {
        requiresAuth: false,
    });
    return response.data;
};