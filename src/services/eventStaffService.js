import API from "@/config/api";

export const createEventStaff = async ({ emails, eventId, message, roleName, expiredAt }) => {
    const response = await API.post('/api/v1/event-staff', { emails, eventId, message, roleName, expiredAt }, {
        requiresAuth: true
    });
    return response.data;
};

export const getEventStaffs = async ({ email, status, eventId, page, size }) => {
    const reqStatus = status === "ALL" ? null : status;
    const response = await API.post(`/api/v1/event-staff/filter?page=${page}&size=${size}`,
        { email, eventId, status: reqStatus, }, {
        requiresAuth: true
    });
    return response.data;
};

export const acceptEventStaff = async ({ token }) => {
    const response = await API.post(`/api/v1/event-staff/accept/${token}`, {
        requiresAuth: true
    });
    return response.data;
};

export const rejectEventStaff = async ({ token, rejectionMessage }) => {
    const response = await API.post(`/api/v1/event-staff/reject/${token}`, { rejectionMessage }, {
        requiresAuth: true
    });
    return response.data;
};

export const getEventStaffByToken = async ({ token }) => {
    const response = await API.get(`/api/v1/event-staff/${token}`, {
        requiresAuth: true
    });
    return response.data;
};

export const revokeEventStaff = async ({ id }) => {
    const response = await API.post(`/api/v1/event-staff/revoke/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

export const getEventStaffById = async ({ id }) => {
    const response = await API.get(`/api/v1/event-staff/filter/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

