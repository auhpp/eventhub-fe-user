import API from "@/config/api";
import { formatDateForBE } from "@/utils/format";

export const updateTicket = async ({ id, data }) => {
    // Map DTO Frontend -> Backend
    const payload = {
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        maxPerOrder: data.maximumPerPurchase,
        invitationQuota: data.invitationQuota,
        description: data.description,
        openAt: formatDateForBE(data.openAt), // Map startDate -> openAt
        endAt: formatDateForBE(data.endAt),     // Map endDate -> endAt
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

export const getTickets = async ({ eventSessionId }) => {
    const response = await API.get(`/api/v1/ticket?eventSessionId=${eventSessionId}`, {
        requiresAuth: true
    });
    return response.data;
};
