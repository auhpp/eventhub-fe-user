import API from "@/config/api";

export const createCoupon = async (requestData) => {

    const response = await API.post('/api/v1/coupon',
        requestData
        , {
            requiresAuth: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    return response.data;
};

export const getCoupons = async ({ eventId, hasPublic, page, size }) => {
    const response = await API.post(`/api/v1/coupon?page=${page}&size=${size}`, { eventId, hasPublic },
        {
            requiresAuth: true
        }
    );
    return response.data;
};

export const checkCodeExists = async (eventId, code) => {
    const response = await API.post(`/api/v1/coupon/exists/${eventId}?code=${code}`,
        {
            requiresAuth: true
        }
    );
    return response.data;
};

export const deleteCoupon = async (couponId) => {
    const response = await API.delete(`/api/v1/coupon/${couponId}`,
        {
            requiresAuth: true
        }
    );
    return response.data;
};

export const getCouponReportDetail = async (couponId) => {
    const response = await API.get(`/api/v1/coupon/report/${couponId}`,
        {
            requiresAuth: true
        }
    );
    return response.data;

};

export const updateCoupon = async (couponId, formData) => {
    const response = await API.put(`/api/v1/coupon/${couponId}`, formData, {
        requiresAuth: true,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getCouponById = async (id) => {
    const response = await API.get(`/api/v1/coupon/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

export const countBookingByUserId = async ({ userId, couponId }) => {
    const response = await API.get(`/api/v1/coupon/${couponId}/count-booking/${userId}`, {
        requiresAuth: true
    });
    return response.data;
};