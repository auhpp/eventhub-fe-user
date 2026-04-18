import API from "@/config/api";

export const createUserNote = async ({ noteContent, audioFile, questionId }) => {
    const formData = new FormData();

    if (noteContent) formData.append('noteContent', noteContent);
    if (audioFile) formData.append('audioFile', audioFile);
    if (questionId) formData.append('questionId', questionId);

    const response = await API.post('/api/v1/user-note', formData, {
        requiresAuth: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const deleteUserNote = async (id) => {
    const response = await API.delete(`/api/v1/user-note/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

export const filterUserNotes = async ({ questionId, userId, page = 1, size = 10 }) => {
    const response = await API.post(`/api/v1/user-note/filter?page=${page}&size=${size}`,
        { questionId, userId },
        {
            requiresAuth: true
        }
    );
    return response.data;
};