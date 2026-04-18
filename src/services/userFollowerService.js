import API from "@/config/api";

export const createUserFollower = async ({ followerId, followedId }) => {
    const response = await API.post('/api/v1/user-follower', {
        followerId,
        followedId
    }, {
        requiresAuth: true,
    });
    return response.data;
};

export const deleteUserFollower = async ({ id }) => {
    const response = await API.delete(`/api/v1/user-follower/${id}`, {
        requiresAuth: true,
    });
    return response.data;
};

export const getUserFollowers = async ({ followerId, followedId, page = 1, size = 10 }) => {
    const response = await API.post(`/api/v1/user-follower/filter?page=${page}&size=${size}`,
        { followerId, followedId }, {
        requiresAuth: true,
    });
    return response.data;
};

export const countUserFollowers = async ({ followerId, followedId }) => {
    const params = new URLSearchParams();
    if (followerId) params.append('followerId', followerId);
    if (followedId) params.append('followedId', followedId);

    const queryString = params.toString() ? `?${params.toString()}` : '';

    const response = await API.get(`/api/v1/user-follower/count${queryString}`, {
        requiresAuth: true,
    });
    return response.data;
};