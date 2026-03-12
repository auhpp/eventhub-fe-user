import API from "@/config/api";

export const createEventSeriesFollower = async ({ eventSeriesId, userId }) => {
    const response = await API.post(`/api/v1/event-series-follower`, { eventSeriesId, userId }, {
        requiresAuth: true
    });
    return response.data;
};

export const deleteEventSeriesFollower = async ({ id }) => {
    const response = await API.delete(`/api/v1/event-series-follower/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

export const getEventSeriesFollowers = async ({ eventSeriesId, userId, page = 1, size = 10 }) => {
    const response = await API.post(`/api/v1/event-series-follower/filter`, { eventSeriesId, userId }, {
        params: { page, size },
        requiresAuth: false
    });
    return response.data;
};

export const countEventSeriesFollowers = async ({ eventSeriesId, userId }) => {
    const response = await API.pos(`/api/v1/event-series-follower/count`, { eventSeriesId, userId }, {
        requiresAuth: false
    });
    return response.data;
};