import API from "@/config/api";

export const getConversations = async ({ hasPin, status, nameMember, page = 1, size = 10 }) => {
    const response = await API.post(
        `/api/v1/conversation/filter?page=${page}&size=${size}`,
        { hasPin, status, nameMember },
        {
            requiresAuth: true
        }
    );
    return response.data;
};

export const getConversationById = async (id) => {
    const response = await API.get(
        `/api/v1/conversation/${id}`,
        {
            requiresAuth: true
        }
    );
    return response.data;
};

export const updateConversation = async ({ id, hasPin, hasNotification }) => {
    const response = await API.put(
        `/api/v1/conversation/${id}`,
        { hasPin, hasNotification }, 
        {
            requiresAuth: true
        }
    );
    return response.data;
};

export const deleteConversation = async ({ id }) => {
    const response = await API.delete(
        `/api/v1/conversation/${id}`,
        {
            requiresAuth: true
        }
    );
    return response.data;
};

export const findByOtherMember = async ({ otherMemberId }) => {
    const response = await API.get(
        `/api/v1/conversation/other-member/${otherMemberId}`,
        {
            requiresAuth: true
        }
    );
    return response.data;
};