import API from "@/config/api";

export const getNotifications = async ({ page = 1, size = 10 }) => {
    const response = await API.get(`/api/v1/notification?page=${page}&size=${size}`, {
        requiresAuth: true
    });
    return response.data;
};

export const seenNotification = async (id) => {
    const response = await API.post(`/api/v1/notification/seen/${id}`, {}, {
        requiresAuth: true
    });
    return response.data;
};

export const deleteNotification = async (id) => {
    const response = await API.delete(`/api/v1/notification/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

export const countUnseenNotification = async () => {
    const response = await API.get(`/api/v1/notification/count`, {
        requiresAuth: true
    });
    return response.data;
};