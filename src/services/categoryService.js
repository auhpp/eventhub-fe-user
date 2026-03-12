import API from "@/config/api";

export const getCategoris = async () => {
    const response = await API.get('/api/v1/category/all', {
        requiresAuth: true
    });
    return response.data;
};

export const getCategoryById = async ({ categoryId }) => {
    const response = await API.get(`/api/v1/category/${categoryId}`, {
        requiresAuth: false
    });
    return response.data;
};