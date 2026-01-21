import API from "@/config/api";
import { EventType } from "@/utils/constant";

export const createEventApi = async ({
    eventData, sessions
}) => {
    const sesstionFormated = sessions.map(
        it => {
            var ticketRequest = it.tickets.map(
                ticket => {
                    return {
                        price: ticket.price,
                        quantity: ticket.quantity,
                        name: ticket.name,
                        openAt: ticket.startDate,
                        endAt: ticket.endDate,
                        maximumPerPurchase: ticket.maxPerOrder
                    }
                }
            )
            return {
                startDateTime: it.startTime,
                endDateTime: it.endTime,
                ticketCreateRequests: ticketRequest
            }
        }
    )
    console.log(sesstionFormated)
    const requestDTO = {
        name: eventData.name,
        type: eventData.type,
        categoryId: eventData.categoryId,
        description: eventData.description,
        eventSessionCreateRequests: sesstionFormated
    }

    if (eventData.type == EventType.OFFLINE.key) {
        requestDTO.location = eventData.location;
        requestDTO.locationLongitude = eventData.coordinates.lng;
        requestDTO.locationLatitude = eventData.coordinates.lat;
    }
    else {
        requestDTO.meetingUrl = eventData.meetingUrl;
        requestDTO.meetingPlatform = eventData.meetingPlatform;
    }

    const formData = new FormData();
    formData.append('thumbnail', eventData.thumbnail);
    formData.append('data', new Blob([JSON.stringify(requestDTO)], { type: "application/json" }));

    const response = await API.post('/api/v1/event',
        formData
        , {
            requiresAuth: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    return response.data;
};


export const getEventsCurrentUser = async ({ page = 1, size = 10 }) => {
    const response = await API.get(`/api/v1/event/current-user?page=${page}&size=${size}`, {
        requiresAuth: true
    });
    return response.data;
};

export const getEvents = async ({ page = 1, size = 10 }) => {
    const response = await API.get(`/api/v1/event?page=${page}&size=${size}`, {
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
