import API from "@/config/api";

// bookingTicketRequests{
// quantity
// ticketId 
//}
export const createPendingBooking = async ({ bookingTicketRequests, type }) => {
    const response = await API.post('/api/v1/booking/pending', { bookingTicketRequests, type }, {
        requiresAuth: false
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

export const getBookingsByCurrentUser = async ({ status, page, size }) => {
    const reqStatus = status === "ALL" ? null : status;
    const response = await API.post(`/api/v1/booking/current-user?page=${page}&size=${size}`, { status: reqStatus }, {
        requiresAuth: true
    });
    return response.data;
}

export const getUserSummaryBookings = async ({ eventSessionId, status, page, size }) => {
    const reqStatus = status === "ALL" ? null : status;
    const response = await API.post(`/api/v1/booking/event-session/${eventSessionId}/filter?page=${page}&size=${size}`,
        { status: reqStatus }, {
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
                ticketInfo: attendee.ticket, // Lưu thông tin loại vé (Tên, giá...)
                items: []
            };
        }
        acc[ticketId].items.push(attendee);
        return acc;
    }, {});
};