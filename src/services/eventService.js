import API from "@/config/api";
import { EventType } from "@/utils/constant";

export const createEventApi = async ({ eventData, sessions }) => {
    // Format Sessions
    const sesstionFormated = sessions.map(it => {
        // Map Ticket
        var ticketRequest = it.tickets.map(ticket => {
            return {
                price: ticket.price,
                description: ticket.description,
                quantity: ticket.quantity,
                name: ticket.name,
                openAt: ticket.openAt,
                endAt: ticket.endAt,
                maximumPerPurchase: ticket.maximumPerPurchase,
                invitationQuota: ticket.invitationQuota,
                cancelBeforeMinutes: ticket.cancelBeforeMinutes
            }
        });

        // create object session base
        const sessionDto = {
            checkinStartTime: it.checkinStartTime,
            startDateTime: it.startTime,
            endDateTime: it.endTime,
            ticketCreateRequests: ticketRequest,
            qaStatus: it.qaStatus || 'DISABLED',
            allowAnonymous: it.allowAnonymous || false,
            requireModerationQuestion: it.requireModerationQuestion || false,
        };

        if (eventData.type === EventType.ONLINE.key) {
            sessionDto.meetingUrl = it.meetingUrl;
            sessionDto.meetingPlatform = it.meetingPlatform;
            sessionDto.meetingPassword = it.meetingPassword;
        }

        return sessionDto;
    });

    console.log("Formatted Sessions:", sesstionFormated);

    const requestDTO = {
        name: eventData.name,
        type: eventData.type,
        categoryId: eventData.categoryId,
        description: eventData.description,
        address: eventData.address,
        eventSessionCreateRequests: sesstionFormated,
        eventSeriesId: eventData.eventSeriesId,
        hasResalable: eventData.hasResalable,
        tags: eventData.tags
    };

    if (eventData.type === EventType.OFFLINE.key) {
        requestDTO.location = eventData.location;
        requestDTO.locationLongitude = eventData.coordinates?.lng;
        requestDTO.locationLatitude = eventData.coordinates?.lat;
    }

    const formData = new FormData();
    formData.append('thumbnail', eventData.thumbnail);
    formData.append('poster', eventData.poster);
    formData.append('data', new Blob([JSON.stringify(requestDTO)], { type: "application/json" }));

    const response = await API.post('/api/v1/event',
        formData, {
        requiresAuth: true,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// request{status, userId, eventSearchStatus, type, categoryIds, thisWeek, thisMonth}
export const getEvents = async ({ request, page = 1, size = 10 }) => {
    const response = await API.post(`/api/v1/event/filter?page=${page}&size=${size}`, request, {
        requiresAuth: true
    });
    return response.data;
};

export const getEventById = async ({ id }) => {
    const response = await API.get(`/api/v1/event/${id}`, {
        requiresAuth: true
    });
    return response.data;
};


export const updateEvent = async ({ id, eventData }) => {
    const requestDTO = {
        name: eventData.name,
        categoryId: eventData.categoryId,
        description: eventData.description,
        address: eventData.address,
        eventSeriesId: eventData.eventSeriesId == "none" ? null : eventData.eventSeriesId,
        hasResalable: eventData.hasResalable,
        tags: eventData.tags
    };

    if (eventData.type === EventType.OFFLINE.key) {
        requestDTO.location = eventData.location;
        requestDTO.locationLongitude = eventData.coordinates?.lng;
        requestDTO.locationLatitude = eventData.coordinates?.lat;
    }

    const formData = new FormData();
    if (eventData.thumbnail) {
        formData.append('thumbnail', eventData.thumbnail);
    }
    if (eventData.poster) {
        formData.append('poster', eventData.poster);
    }
    formData.append('data', new Blob([JSON.stringify(requestDTO)], { type: "application/json" }));

    const response = await API.put(`/api/v1/event/${id}`,
        formData, {
        requiresAuth: true,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const createEventSession = async ({ id, data }) => {
    const response = await API.post(`/api/v1/event/${id}/event-session`, data, {
        requiresAuth: true
    });
    return response.data;
};

export const cancelEvent = async ({ id }) => {
    const response = await API.post(`/api/v1/event/cancel/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

export const countEvent = async (payload) => {
    const response = await API.post(`/api/v1/event/count`, payload, {
        requiresAuth: false
    });
    return response.data;
};

export const eventHasResalable = async ({ id }) => {
    const response = await API.get(`/api/v1/event/has-resalable/${id}`, {
        requiresAuth: true
    });
    return response.data;
};