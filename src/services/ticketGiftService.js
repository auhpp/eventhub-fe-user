import API from "@/config/api";

export const createTicketGift = async ({ receiverId, bookingId, attendeeIds }) => {
    const response = await API.post(`/api/v1/ticket-gift`, { receiverId, bookingId, attendeeIds },
        {
            requiresAuth: true
        });
    return response.data;
};


export const getTicketGifts = async ({ status, receiverEmail, senderEmail, page, size }) => {
    const reqStatus = status === "ALL" ? null : status;
    const response = await API.post(`/api/v1/ticket-gift/filter?page=${page}&size=${size}`, {
        status: reqStatus,
        receiverEmail, senderEmail
    }, {
        requiresAuth: true
    });
    return response.data;
};

export const acceptTicketGift = async ({ id }) => {
    const response = await API.post(`/api/v1/ticket-gift/accept/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

export const rejectTicketGift = async ({ id, rejectionMessage }) => {
    const response = await API.post(`/api/v1/ticket-gift/reject/${id}`, { rejectionMessage }, {
        requiresAuth: true
    });
    return response.data;
};

export const getTicketGiftById = async ({ id }) => {
    const response = await API.get(`/api/v1/ticket-gift/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

export const revokeTicketGift = async ({ id }) => {
    const response = await API.post(`/api/v1/ticket-gift/revoke/${id}`, {
        requiresAuth: true
    });
    return response.data;
};


export const getAttendeeTicketGifts = async ({ id }) => {
    const response = await API.get(`/api/v1/ticket-gift/${id}/attendees`, {
        requiresAuth: true
    });
    return response.data;
};
