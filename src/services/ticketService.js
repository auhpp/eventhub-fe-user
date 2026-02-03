import API from "@/config/api";
import { formatDateForBE } from "@/utils/format";

export const updateTicket = async ({ id, data }) => {
    // Map DTO Frontend -> Backend
    const payload = {
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        maxPerOrder: data.maxPerOrder,
        invitationQuota: data.invitationQuota,
        description: data.description,
        openAt: formatDateForBE(data.startDate), // Map startDate -> openAt
        endAt: formatDateForBE(data.endDate),     // Map endDate -> endAt
        maximumPerPurchase: data.maxPerOrder     
    };

    const response = await API.put(`/api/v1/ticket/${id}`, payload, {
        requiresAuth: true
    });
    return response.data;
};

export const deleteTicket = async ({ id }) => {
    const response = await API.delete(`/api/v1/ticket/${id}`, {
        requiresAuth: true
    });
    return response.data;
};