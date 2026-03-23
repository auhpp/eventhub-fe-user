import API from "@/config/api";

export const getSystemConfigByKey = async ({ key }) => {
    const response = await API.get('/api/v1/system-config/' + key, {
        requiresAuth: true
    });
    return response.data;
};
