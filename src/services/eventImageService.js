import API from "@/config/api";

export const uploadEventImages = async (eventSessionId, files) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append("files", file);
    });
    const response = await API.post(`/api/v1/event-image/${eventSessionId}`, formData, {
        requiresAuth: true,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const getEventImages = async ({ eventSessionId, page = 1, size = 10, status = "" }) => {
    const params = { page, size };
    if (status && status !== "ALL") {
        params.processStatus = status;
    }

    const response = await API.get(`/api/v1/event-image/filter/${eventSessionId}`, { params }, {
        requiresAuth: true,
    });
    return response.data;
};

export const searchPhotos = async ({ eventSessionId, file }) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await API.post(`/api/v1/event-image/search/${eventSessionId}`, formData, {
        requiresAuth: true,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const refreshProcessImages = async ({ eventSessionId }) => {
    const response = await API.post(`/api/v1/event-image/refresh/${eventSessionId}`, {
        requiresAuth: true
    });
    return response.data;
};


export const deleteEventImage = async ({ imageId }) => {
    const response = await API.delete(`/api/v1/event-image/${imageId}`, {
        requiresAuth: true
    });
    return response.data;
};