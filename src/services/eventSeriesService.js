import API from "@/config/api";

export const createEventSeries = async ({ formData }) => {
    const response = await API.post('/api/v1/event-series', formData, {
        requiresAuth: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const deleteEventSeries = async ({ id }) => {
    const response = await API.delete(`/api/v1/event-series/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

export const updateEventSeries = async ({ id, formData }) => {
    const response = await API.put(`/api/v1/event-series/${id}`, formData, {
        requiresAuth: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getEventSeries = async ({ searchData, page = 1, size = 10 }) => {
    const response = await API.post('/api/v1/event-series/filter', searchData, {
        params: { page, size },
        requiresAuth: false
    });
    return response.data;
};

export const getEventSeriesById = async ({ id }) => {
    const response = await API.get(`/api/v1/event-series/${id}`, {
        requiresAuth: false
    });
    return response.data;
};


export const getAllEventSeries = async () => {
    const response = await API.get('/api/v1/event-series/all', {
        requiresAuth: true
    });
    return response.data;
};