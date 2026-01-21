import axios from 'axios';
import { routes } from './routes';

const baseURL = import.meta.env.VITE_BASE_URL

const API = axios.create({
    baseURL: baseURL,
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

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axios.post(
                    `${baseURL}/api/v1/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newToken = res.data.result.accessToken;
                localStorage.setItem('access_token', newToken);

                API.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;

                processQueue(null, newToken);

                originalRequest.headers.Authorization = 'Bearer ' + newToken;
                return API(originalRequest);

            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem('access_token');

                const isAuthRequest = originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register');

                const isOnHomePage = window.location.pathname === routes.home;

                if (!isAuthRequest && !isOnHomePage) {
                    window.location.href = routes.signin;
                }

                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default API;