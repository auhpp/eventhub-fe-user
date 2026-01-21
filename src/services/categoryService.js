import API from "@/config/api";

export const getCategoris = async () => {
    const response = await API.get('/api/v1/category/all', {
        requiresAuth: true
    });
    return response.data;
};