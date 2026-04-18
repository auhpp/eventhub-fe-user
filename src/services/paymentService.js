import API from "@/config/api";

// bookingPaymentRequest: customerName, customerPhone, walletType
export const createPaymentUrl = async ({ bookingId, bookingPaymentRequest }) => {
    const response = await API.post(`/api/v1/payment/create-payment-url/${bookingId}`,
        bookingPaymentRequest, {
        requiresAuth: true
    });
    return response.data;
};

export const confirmPaymentBooking = async ({ vnpTxnRef, vnpPayDate }) => {
    const response = await API.post(`/api/v1/payment/confirm-payment-order`,
        { vnpTxnRef, vnpPayDate }, {
        requiresAuth: true
    });
    return response.data;
};
