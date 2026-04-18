import API from "@/config/api";

export const getAttendeeByCurrentUser = async ({ attendeeStatus, page = 1, size = 10 }) => {
    const response = await API.post(`/api/v1/attendee/current-user?page=${page}&size=${size}`, { searchStatus: attendeeStatus }, {
        requiresAuth: true
    });
    return response.data;
};

export const getAttendeeById = async ({ id }) => {
    const response = await API.get(`/api/v1/attendee/${id}`, {
        requiresAuth: true
    });
    return response.data;
};


export const assignAttendeeEmail = async ({ attendeeId, email }) => {
    const response = await API.post(`/api/v1/attendee/${attendeeId}/assign/${email}`, {
        requiresAuth: true
    });
    return response.data;
};

export const getMeetingUrl = async ({ attendeeId }) => {
    const response = await API.get(`/api/v1/attendee/${attendeeId}/join-link`, {
        requiresAuth: true
    });
    return response.data;
};


export const getUserSummaryAttendees = async ({ email, name, types, eventSessionId, statuses, page, size }) => {
    const response = await API.post(`/api/v1/attendee/event-session/${eventSessionId}/filter?page=${page}&size=${size}`,
        { statuses: statuses, types, email, name }, {
        requiresAuth: true
    });
    return response.data;
}

export const getTicketCode = async ({ id }) => {
    const response = await API.get(`/api/v1/attendee/ticket-code/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

export const importCheckInAttendance = async ({ id, emails }) => {
    const response = await API.post(`/api/v1/attendee/check-in/import/${id}`, { emails }, {
        requiresAuth: true
    });
    return response.data;
};

export const checkInManual = async ({ attendeeId, actionType, eventId }) => {
    const response = await API.post(`/api/v1/attendee/check-in/manual/${attendeeId}?actionType=${actionType}&eventId=${eventId}`, {
        requiresAuth: true
    });
    return response.data;
};

export const getAttendeeCheckedIns = async ({ ticketId, email, page, size }) => {
    const response = await API.get(`/api/v1/attendee/check-in/ticket/${ticketId}?email=${email}&page=${page}&size=${size}`, {
        requiresAuth: true
    });
    return response.data;
};

export const getCheckInLogs = async ({ ticketCode, attendeeId, actionType, eventStaffId, fromTime, toTime,
    page, size }) => {
    const response = await API.post(`/api/v1/attendee/check-in/logs?page=${page}&size=${size}`,
        { ticketCode, attendeeId, actionType, eventStaffId, fromTime, toTime }, {
        requiresAuth: true
    });
    return response.data;
};


export const exportReportAttendees = async ({ email, name, types, eventSessionId, statuses, eventName
}) => {

    const response = await API.post(`/api/v1/attendee/reports/export?eventName=${eventName}`, {
        email, name, types, eventSessionId, statuses
    }, {
        responseType: 'blob',
        requiresAuth: true
    });
    return response.data;
}

export const countBoughtTicket = async ({ ticketId, userId }) => {
    const response = await API.get(`/api/v1/attendee/ticket/${ticketId}/user/${userId}`, {
        requiresAuth: true
    });
    return response.data;
};