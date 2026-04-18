import API from "@/config/api";

// bookingTicketRequests{
// quantity
// ticketId 
//}
export const createPendingBooking = async ({ bookingTicketRequests, type }) => {
    const response = await API.post('/api/v1/booking/pending', { bookingTicketRequests, type }, {
        requiresAuth: true
    });
    return response.data;
};

export const createResalePendingBooking = async ({ attendeeIds, type, resalePostId }) => {
    const response = await API.post('/api/v1/booking/resale/pending', { attendeeIds, type, resalePostId }, {
        requiresAuth: true
    });
    return response.data;
};


export const getBookingById = async ({ id }) => {
    const response = await API.get(`/api/v1/booking/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

export const deleteBookingById = async ({ id }) => {
    const response = await API.delete(`/api/v1/booking/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

export const getExistsPendingBooking = async ({ eventSessionId }) => {
    const response = await API.get(`/api/v1/booking/event-session/${eventSessionId}`, {
        requiresAuth: true
    });
    return response.data;
};

export const getBookings = async ({ types, email, bookingId, userId, eventSessionId, status, upcoming, page, size,
    startDateTime, endDateTime }) => {
    const reqStatus = status === "ALL" ? null : status;
    const response = await API.post(`/api/v1/booking/filter?page=${page}&size=${size}`, {
        email,
        bookingId,
        status: reqStatus,
        userId, eventSessionId,
        upcoming: upcoming,
        types, startDateTime, endDateTime
    }, {
        requiresAuth: true
    });
    return response.data;
}


export const getUserSummaryBooking = async ({ eventSessionId, userId }) => {
    const response = await API.get(`/api/v1/booking/event-session/${eventSessionId}/user/${userId}`, {
        requiresAuth: true
    });
    return response.data;
}

export const groupAttendeesByTicket = (attendees = []) => {
    return attendees.reduce((acc, attendee) => {
        const ticketId = attendee.ticket.id;

        if (!acc[ticketId]) {
            acc[ticketId] = {
                ticketInfo: attendee.ticket, 
                items: []
            };
        }
        acc[ticketId].items.push(attendee);
        return acc;
    }, {});
};

export const getExistsPendingResaleBooking = async ({ resalePostId }) => {
    const response = await API.get(`/api/v1/booking/resale/${resalePostId}`, {
        requiresAuth: true
    });
    return response.data;
};

export const exportReportBookings = async ({ types, email,
    bookingId, userId, eventSessionId, status, startDateTime, endDateTime, eventName
}) => {
    const reqStatus = status === "ALL" ? null : status;
    const response = await API.post(`/api/v1/booking/reports/export?eventName=${eventName}`, {
        email,
        bookingId,
        status: reqStatus,
        userId, eventSessionId,
        types, startDateTime, endDateTime
    }, {
        responseType: 'blob',
        requiresAuth: true
    });
    return response.data;
}