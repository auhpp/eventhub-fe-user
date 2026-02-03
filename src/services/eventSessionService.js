import API from "@/config/api";
import { formatDateForBE } from "@/utils/format";

export const getEventSessionById = async ({ id }) => {
    const response = await API.get(`/api/v1/event-session/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

export const updateEventSession = async ({ id, data }) => {
    // Map DTO Frontend -> Backend
    const payload = {
        checkinStartTime: formatDateForBE(data.checkinStartTime),
        startDateTime: formatDateForBE(data.startTime),
        endDateTime: formatDateForBE(data.endTime),
        meetingUrl: data.meetingUrl,
        meetingPlatform: data.meetingPlatform != "" ? data.meetingPlatform : null,
        meetingPassword: data.meetingPassword
    };

    const response = await API.put(`/api/v1/event-session/${id}`, payload, {
        requiresAuth: true
    });
    return response.data;
};


export const createTicket = async ({ id, data }) => {
    const response = await API.post(`/api/v1/event-session/${id}/ticket`, data, {
        requiresAuth: true
    });
    return response.data;
};

export const deleteEventSession = async ({ id }) => {
    const response = await API.delete(`/api/v1/event-session/${id}`, {
        requiresAuth: true
    });
    return response.data;
};