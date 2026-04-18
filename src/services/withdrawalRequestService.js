
import API from "@/config/api";

export const createWithdrawalRequest = async (data) => {
    // { amount, bankCode, bankAccountNo, bankAccountName, walletId }
    const response = await API.post(`/api/v1/withdrawal-request`, data, {
        requiresAuth: true
    });
    return response.data;
};

export const updateWithdrawalRequest = async ({ id, data }) => {
 
    const formData = new FormData();

    if (data.amount !== undefined) formData.append('amount', data.amount);
    if (data.bankCode) formData.append('bankCode', data.bankCode);
    if (data.bankAccountNo) formData.append('bankAccountNo', data.bankAccountNo);
    if (data.bankAccountName) formData.append('bankAccountName', data.bankAccountName);
    if (data.status) formData.append('status', data.status);
    if (data.adminNote) formData.append('adminNote', data.adminNote);

    // proofImage
    if (data.proofImage) {
        formData.append('proofImage', data.proofImage);
    }

    const response = await API.put(`/api/v1/withdrawal-request/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data', 
        },
        requiresAuth: true
    });
    return response.data;
};

export const filterWithdrawalRequests = async ({ data, page = 1, size = 10 }) => {
    const response = await API.post(`/api/v1/withdrawal-request/filter`, data, {
        params: {
            page,
            size
        },
        requiresAuth: true
    });
    return response.data;
};

export const getWithdrawalRequestById = async (id) => {
    const response = await API.get(`/api/v1/withdrawal-request/${id}`, {
        requiresAuth: true
    });
    return response.data;
};