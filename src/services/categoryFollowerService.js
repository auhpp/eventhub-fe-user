import API from "@/config/api";

export const createCategoryFollower = async ({ categoryId, userId, }) => {
    const response = await API.post(`/api/v1/category-follower`, { categoryId, userId, }, {
        requiresAuth: true
    });
    return response.data;
};

export const deleteCategoryFollower = async ({ id }) => {
    const response = await API.delete(`/api/v1/category-follower/${id}`, {
        requiresAuth: true
    });
    return response.data;
};

export const getCategoryFollowers = async ({ categoryId, userId, page = 1, size = 10 }) => {
    const response = await API.post(`/api/v1/category-follower/filter`, { categoryId, userId }, {
        params: { page, size },
        requiresAuth: false
    });
    return response.data;
};

export const countCategoryFollower = async ({ categoryId, userId }) => {
    const response = await API.post(`/api/v1/category-follower/count`, { categoryId, userId }, {
        requiresAuth: false
    });
    return response.data;
};