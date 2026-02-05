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