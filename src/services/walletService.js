
import API from "@/config/api";

export const filterWallets = async ({ data, page = 1, size = 10 }) => {
    const response = await API.post(`/api/v1/wallet/filter`, data, {
        params: {
            page,
            size
        },
        requiresAuth: true 
    });
    return response.data;
};

export const getWalletById = async (id) => {
    const response = await API.get(`/api/v1/wallet/${id}`, {
        requiresAuth: true
    });
    return response.data;
};