import API from "@/config/api";

export const getInvoiceUrl = async ({ bookingId }) => {
    const response = await API.get(`/api/v1/invoice/${bookingId}`, {
        requiresAuth: true
    });
    return response.data;
};