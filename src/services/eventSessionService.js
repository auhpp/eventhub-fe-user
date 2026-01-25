import API from "@/config/api";

export const getEventSessionById = async ({ id }) => {
    const response = await API.get(`/api/v1/event-session/${id}`, {
        requiresAuth: true
    });
    return response.data;
};