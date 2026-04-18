import API from "@/config/api";

export const verifyOtp = async ({ email, otpCode }) => {
    const response = await API.post(`/api/v1/otp/verify`, {
        email, otpCode
    },
        {
            requiresAuth: false
        });
    return response.data;
};