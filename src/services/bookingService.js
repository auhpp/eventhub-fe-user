import API from "@/config/api";

// bookingTicketRequests{
// quantity
// ticketId 
//}
export const createPendingBooking = async ({ bookingTicketRequests }) => {
    const response = await API.post('/api/v1/booking/pending', { bookingTicketRequests }, {
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
    const response = await API.post(`/api/v1/booking/current-user?page=${page}&size=${size}`, { status }, {
        requiresAuth: true
    });
    return response.data;
}