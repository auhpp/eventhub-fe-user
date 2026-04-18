import API from "@/config/api";

export const getEventStats = async ({ eventSessionId, organizerId, eventSeriesId,
    startDate, endDate }) => {
    const response = await API.post(`/api/v1/stats/overview`,
        {
            eventSessionId, organizerId, eventSeriesId,
            dateRangeFilter: { startDate, endDate }
        },
        {
            requiresAuth: true
        });
    return response.data;
};


export const getTopEventRevenue = async ({ organizerId, eventSeriesId,
    startDate, endDate, limit }) => {
    const response = await API.post(`/api/v1/stats/revenue/top-events`,
        {
            organizerId, eventSeriesId,
            dateRangeFilter: { startDate, endDate }
            , paginationRequest: { limit }
        },
        {
            requiresAuth: true
        });
    return response.data;
};

export const getVoucherRevenueWithTimeLabel = async ({ organizerId, eventSeriesId,
    startDate, endDate }) => {
    const response = await API.post(`/api/v1/stats/revenue/chart`,
        {
            organizerId, eventSeriesId,
            dateRangeFilter: { startDate, endDate }
        },
        {
            requiresAuth: true
        });
    return response.data;
};


export const getReviewSummary = async ({ organizerId, eventSeriesId,
    startDate, endDate }) => {
    const response = await API.post(`/api/v1/stats/reviews-summary`,
        {
            organizerId, eventSeriesId,
            dateRangeFilter: { startDate, endDate }
        },
        {
            requiresAuth: true
        });
    return response.data;
};