import API from "@/config/api";

export const uploadEventImages = async (eventId, files) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append("files", file);
    });
    const response = await API.post(`/api/v1/event-image/${eventId}`, formData, {
        requiresAuth: true,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const getEventImages = async ({ eventId, page = 1, size = 10, status = "" }) => {
    const params = { page, size };
    if (status && status !== "ALL") {
        params.processStatus = status;
    }

    const response = await API.get(`/api/v1/event-image/filter/${eventId}`, { params }, {
        requiresAuth: true,
    });
    return response.data;
};

export const searchPhotos = async ({ eventId, file }) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await API.post(`/api/v1/event-image/search/${eventId}`, formData, {
        requiresAuth: true,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};