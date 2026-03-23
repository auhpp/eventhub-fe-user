import API from "@/config/api";

export const createResalePost = async ({ pricePerTicket, ticketId, hasRetail, attendeeIds }) => {
    const response = await API.post('/api/v1/resale-post', {
        pricePerTicket,
        ticketId,
        hasRetail,
        attendeeIds
    }, {
        requiresAuth: true
    });
    return response.data;
}

export const updateResalePost = async ({ id, ticketId, pricePerTicket, hasRetail }) => {
    const response = await API.put(`/api/v1/resale-post/${id}`, {
        ticketId,
        pricePerTicket,
        hasRetail
    }, {
        requiresAuth: true
    });
    return response.data;
}

export const approveResalePost = async ({ id }) => {
    const response = await API.post(`/api/v1/resale-post/${id}/approve`, {
        requiresAuth: true
    });
    return response.data;
}

export const cancelResalePostByAdmin = async ({ id, reason }) => {
    const response = await API.post(`/api/v1/resale-post/${id}/cancel-by-admin`, {
        reason
    }, {
        requiresAuth: true
    });
    return response.data;
}

export const rejectResalePost = async ({ id, reason }) => {
    const response = await API.post(`/api/v1/resale-post/${id}/reject`, {
        reason
    }, {
        requiresAuth: true
    });
    return response.data;
}

export const cancelResalePost = async ({ id }) => {
    const response = await API.post(`/api/v1/resale-post/${id}/cancel`, null, {
        requiresAuth: true
    });
    return response.data;
}

export const filterResalePosts = async ({ sortType, quantity, eventSessionId, ticketId, hasRetail, 
    userId, statuses, page = 1, size = 10 }) => {
    const reqStatuses = statuses?.includes("ALL") ? null : statuses;

    const response = await API.post(`/api/v1/resale-post/filter?page=${page}&size=${size}`, {
        sortType,
        quantity,
        eventSessionId,
        ticketId,
        hasRetail,
        userId,
        statuses: reqStatuses
    }, {
        requiresAuth: true 
    });
    return response.data;
}

export const getResalePostById = async ({ id }) => {
    const response = await API.get(`/api/v1/resale-post/${id}`, {
        requiresAuth: true
    });
    return response.data;
}