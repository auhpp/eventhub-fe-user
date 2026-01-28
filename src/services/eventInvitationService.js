import API from "@/config/api";

export const createEventInvitation = async (eventInvitationCreateRequest) => {
    // data: { emails: [], ticketId, message, initialQuantity, expiredAt }
    const response = await API.post('/api/v1/event-invitation', eventInvitationCreateRequest, {
        requiresAuth: false
    });
    return response.data;
};

export const getEventInvitations = async ({ status, eventSessionId, page, size }) => {
    const reqStatus = status === "ALL" ? null : status;
    const response = await API.post(`/api/v1/event-invitation/filter?page=${page}&size=${size}`, { status: reqStatus, eventSessionId }, {
        requiresAuth: true
    });
    return response.data;
};

export const acceptEventInvitation = async ({ token }) => {
    const response = await API.post(`/api/v1/event-invitation/accept/${token}`, {
        requiresAuth: false
    });
    return response.data;
};

export const rejectEventInvitation = async ({ token, rejectionMessage }) => {
    const response = await API.post(`/api/v1/event-invitation/reject/${token}`, { rejectionMessage }, {
        requiresAuth: false
    });
    return response.data;
};

export const getEventInvitationByToken = async ({ token }) => {
    const response = await API.get(`/api/v1/event-invitation/${token}`, {
        requiresAuth: false
    });
    return response.data;
};

export const revokeEventInvitation = async ({ id }) => {
    const response = await API.post(`/api/v1/event-invitation/revoke/${id}`, {
        requiresAuth: false
    });
    return response.data;
};
