import API from "@/config/api"; 


export const createTag = async (data) => {
    const response = await API.post(`/api/v1/tag`, data, {
        requiresAuth: true
    });
    return response.data;
};

export const getAllTags = async (data = {}) => {
    const response = await API.post(`/api/v1/tag/all`, data, {
        requiresAuth: true
    });
    return response.data;
};

export const filterTags = async ({ page = 1, size = 10, ...searchData }) => {
    const response = await API.post(`/api/v1/tag/filter?page=${page}&size=${size}`, searchData, {
        requiresAuth: true
    });
    return response.data;
};