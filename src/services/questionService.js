import API from "@/config/api";

export const createQuestion = async (data) => {
    // data tương ứng với QuestionCreateRequest: { content, hasAnonymous, eventSessionId }
    const response = await API.post(`/api/v1/question`, data, {
        requiresAuth: true
    });
    return response.data;
};

export const updateQuestion = async ({ id, data }) => {
    // data tương ứng với QuestionUpdateRequest: { content, status, hasAnonymous }
    const response = await API.put(`/api/v1/question/${id}`, data, {
        requiresAuth: true
    });
    return response.data;
};

export const deleteQuestion = async ({ id }) => {
    const response = await API.delete(`/api/v1/question/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

export const upvoteQuestion = async ({ id }) => {
    const response = await API.post(`/api/v1/question/upvote/${id}`, {}, {
        requiresAuth: true
    });
    return response.data;
};

export const filterQuestions = async ({ data, page = 1, size = 10 }) => {
    // data tương ứng với QuestionSearchRequest: { eventSessionId, userId, status }
    const response = await API.post(`/api/v1/question/filter?page=${page}&size=${size}`, data, {
        requiresAuth: true
    });
    return response.data;
};