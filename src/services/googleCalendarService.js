import API from "@/config/api";

export const connectAndAddEventGoogleCalendar = async ({
    authCode,
    userId,
    eventSessionId,
    ticketCount,
    bookingId
}) => {
    const response = await API.post(`/api/v1/google-calendar`, {
        authCode,
        userId,
        eventSessionId,
        ticketCount,
        bookingId
    }, {
        requiresAuth: true
    });
    return response.data;
};
