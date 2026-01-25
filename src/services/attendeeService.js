import API from "@/config/api";

export const getAttendeeByCurrentUser = async ({ attendeeStatus, page = 1, size = 10 }) => {
    const response = await API.post(`/api/v1/attendee/current-user?page=${page}&size=${size}`, { status: attendeeStatus }, {
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
