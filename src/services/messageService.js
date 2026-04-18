import API from "@/config/api";

export const createMessage = async (formData) => {
    const response = await API.post('/api/v1/message', formData, {
        requiresAuth: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const markMessageSeen = async (id) => {
    const response = await API.post(`/api/v1/message/seen/${id}`, {}, {
        requiresAuth: true
    });
    return response.data;
};

export const markMessageReceived = async (id) => {
    const response = await API.post(`/api/v1/message/receive/${id}`, {}, {
        requiresAuth: true
    });
    return response.data;
};

export const countUnseenMessages = async ({ conversationId }) => {
    const response = await API.post('/api/v1/message/unseen', { conversationId }, {
        requiresAuth: true
    });
    return response.data;
};

export const getMessages = async ({ conversationId, page = 1, size = 10 }) => {
    const response = await API.post(
        `/api/v1/message/filter?page=${page}&size=${size}`,
        { conversationId },
        {
            requiresAuth: true
        }
    );
    return response.data;
};

export const getMessageRecipients = async (id) => {
    const response = await API.get(`/api/v1/message/${id}/recipient`, {
        requiresAuth: true
    });
    return response.data;
};


export const seenByConversation = async ({ conversationId }) => {
    const response = await API.post(`/api/v1/message/seen/conversation/${conversationId}`, {
        requiresAuth: true
    });
    return response.data;
};


export const receiveAllMessageInConversation = async () => {
    const response = await API.post(`/api/v1/message/receive/all`, {
        requiresAuth: true
    });
    return response.data;
};
