import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Add access token to headers
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token && config.requiresAuth !== false) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle 401 errors
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/token')
        ) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = 'Bearer ' + token;
                        return API(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            isRefreshing = true;

            try {
                const res = await axios.post(
                    'http://localhost:8080/auth/refresh',
                    {},
                    { withCredentials: true }
                );

                const newToken = res.data.result.accessToken;
                localStorage.setItem('access_token', newToken);
                API.defaults.headers.Authorization = 'Bearer ' + newToken;

                processQueue(null, newToken);

                return API(originalRequest);
            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem('access_token');
                window.location.href = '/signin';
                // return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        // return Promise.reject(error);

    }
);

export default API; 