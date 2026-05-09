import API from "@/config/api";

export const createReview = async (formData) => {
    const response = await API.post('/api/v1/review', formData, {
        requiresAuth: true,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getReviews = async ({ organizerId, eventSessionId, userId, attendeeId, rating, email, page = 1, size = 10 }) => {
    const response = await API.post(`/api/v1/review/filter?page=${page}&size=${size}`, {
        email, rating, eventSessionId, userId, attendeeId, organizerId
    },
        {
            requiresAuth: false
        }
    );
    return response.data;
};

export const updateReview = async (reviewId, formData) => {
    const response = await API.post(`/api/v1/review/${reviewId}`, formData, {
        requiresAuth: true,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};


export const getReviewStats = async ({ eventSessionId }) => {
    const response = await API.get(`/api/v1/review/stats/${eventSessionId}`, {
        requiresAuth: false,
    });
    return response.data;
};

export const replyReview = async ({ reviewId, replyMessage, eventStaffId }) => {
    const response = await API.post(`/api/v1/review/reply/${reviewId}`, { replyMessage, eventStaffId }, {
        requiresAuth: true,
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};