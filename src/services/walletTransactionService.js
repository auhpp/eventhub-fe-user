import API from "@/config/api";

export const filterWalletTransactions = async ({ data, page = 1, size = 10 }) => {

    const response = await API.post(`/api/v1/wallet-transaction/filter`, data, {
        params: {
            page,
            size
        },
        requiresAuth: true 
    });
    return response.data;
};