import API from "@/config/api";

export const createOrganizerRegistrationRequest = async ({
    businessName, businessAvatar,
    representativeFullName, phoneNumber,
    email, biography, contactAddress, type, taxCode
}) => {

    const formData = new FormData();

    formData.append('businessName', businessName);
    formData.append('representativeFullName', representativeFullName);
    formData.append('phoneNumber', phoneNumber);
    formData.append('email', email);
    formData.append('contactAddress', contactAddress);
    formData.append('biography', biography);
    formData.append('businessAvatar', businessAvatar);
    formData.append('type', type);
    formData.append('taxCode', taxCode);


    const response = await API.post('/api/v1/organizer-registration',
        formData
        , {
            requiresAuth: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    return response.data;
};


export const getOrganizerRegistrations = async ({ userId, status, page, size }) => {
    const response = await API.post(`/api/v1/organizer-registration/filter?page=${page}&size=${size}`,
        { userId, status }, {
        requiresAuth: true
    });
    return response.data;
};

export const getOrganizerRegistrationById = async ({ id }) => {
    const response = await API.get('/api/v1/organizer-registration/' + id, {
        requiresAuth: true
    });
    return response.data;
};


export const cancelOrganizerRegistrationRequest = async ({ id }) => {
    const response = await API.post('/api/v1/organizer-registration/cancel/' + id, {
        requiresAuth: true
    });
    return response.data;
};

export const updateOrganizerRegistrationRequest = async ({ id, data }) => {
    const formData = new FormData();

    formData.append("businessName", data.businessName);
    formData.append("representativeFullName", data.representativeFullName);
    formData.append("email", data.email);
    formData.append("phoneNumber", data.phoneNumber);
    formData.append("biography", data.biography);
    formData.append("contactAddress", data.contactAddress);
    formData.append('type', data.type);
    formData.append('taxCode', data.taxCode);

    if (data.businessAvatar instanceof File) {
        formData.append("businessAvatar", data.businessAvatar);
    }

    const response = await API.put(`/api/v1/organizer-registration/${id}`,
        formData
        , {
            requiresAuth: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    return response.data;
};