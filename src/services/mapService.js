import API from "@/config/api";

export const getAddresses = async ({ query }) => {
    const response = await API.get('/api/v1/map/geocode?query=' + query, {
        requiresAuth: true
    });
    return response.data;
};