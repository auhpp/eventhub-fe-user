import API from "@/config/api";

export const createFavorite = async (eventId) => {
    const response = await API.post(`/api/v1/favorite?eventId=${eventId}`, {
        requiresAuth: true
    });
    return response.data;
};

export const deleteFavorite = async (eventId) => {
    const response = await API.delete(`/api/v1/favorite?eventId=${eventId}`, {
        requiresAuth: true
    });
    return response.data;
};

export const getEventIdFavorite = async () => {
    const response = await API.get(`/api/v1/favorite`, {
        requiresAuth: true
    });
    return response.data;
};