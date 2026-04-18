
import API from "@/config/api";

export const createPaymentMethod = async (data) => {
    const response = await API.post(`/api/v1/payment-method`, data, {
        requiresAuth: true
    });
    return response.data;
};

export const updatePaymentMethod = async ({ id, data }) => {
    const response = await API.put(`/api/v1/payment-method/${id}`, data, {
        requiresAuth: true
    });
    return response.data;
};

export const deletePaymentMethod = async (id) => {
    const response = await API.delete(`/api/v1/payment-method/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

export const getAllPaymentMethods = async () => {
    const response = await API.get(`/api/v1/payment-method`, {
        requiresAuth: true
    });
    return response.data;
};