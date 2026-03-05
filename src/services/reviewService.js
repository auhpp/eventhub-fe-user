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

export const getReviews = async ({ eventSessionId, userId, attendeeId, page = 1, size = 10 }) => {
    const response = await API.post(`/api/v1/review/filter?page=${page}&size=${size}`, { eventSessionId, userId, attendeeId },
        {
            requiresAuth: true
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