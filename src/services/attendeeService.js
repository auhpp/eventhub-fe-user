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
