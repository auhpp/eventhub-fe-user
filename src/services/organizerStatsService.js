import API from "@/config/api";

export const getOrganizerKpiReport = async ({ organizerId, startDate, endDate }) => {
    const response = await API.get(`/api/v1/organizer/reports/kpis/${organizerId}`, {
        params: { startDate, endDate },
        requiresAuth: true
    });
    return response.data;
};

export const getVoucherRevenueWithTimeLabel = async ({ organizerId, startDate, endDate }) => {
    const response = await API.get(`/api/v1/organizer/reports/trends/${organizerId}`, {
        params: { startDate, endDate },
        requiresAuth: true
    });
    return response.data;
};

export const getOrganizerTopEventReport = async ({ organizerId, startDate, endDate, limit }) => {
    const response = await API.get(`/api/v1/organizer/reports/top-events/${organizerId}`, {
        params: { startDate, endDate, limit },
        requiresAuth: true
    });
    return response.data;
};

export const getOrganizerReviewSummary = async ({ organizerId, startDate, endDate }) => {
    const response = await API.get(`/api/v1/organizer/reports/reviews-summary/${organizerId}`, {
        params: { startDate, endDate },
        requiresAuth: true
    });
    return response.data;
};