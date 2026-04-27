import axios from 'axios';
import { lookInSession, storeInSession, removeFromSession } from './session';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_DOMAIN,
});

// Auto-attach auth token from session
api.interceptors.request.use((config) => {
    const userSession = lookInSession("user");
    if (userSession) {
        const { access_token } = JSON.parse(userSession);
        if (access_token) {
            config.headers.Authorization = `Bearer ${access_token}`;
        }
    }
    return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Global error handling and transparent token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        // If 401 and we haven't retried yet
        if (status === 401 && !originalRequest._retry) {
            // If already refreshing, queue the request
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const userSession = lookInSession("user");
            if (userSession) {
                const userData = JSON.parse(userSession);
                const { refresh_token } = userData;

                if (refresh_token) {
                    try {
                        const { data } = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/refresh-token`, { refresh_token });
                        
                        // Update session with new tokens
                        userData.access_token = data.access_token;
                        if (data.refresh_token) userData.refresh_token = data.refresh_token;
                        storeInSession("user", JSON.stringify(userData));

                        processQueue(null, data.access_token);
                        
                        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                        isRefreshing = false;
                        
                        // Retry original request
                        return api(originalRequest);
                    } catch (err) {
                        processQueue(err, null);
                        isRefreshing = false;
                        removeFromSession("user");
                        toast.error("Session expired. Please log in again.");
                        setTimeout(() => window.location.href = "/signin", 1500);
                        return Promise.reject(err);
                    }
                }
            }
        }

        if (status === 429) {
            toast.error("Too many requests. Please slow down.");
        } else if (status >= 500) {
            toast.error("Server error. Please try again later.");
        } else if (status === 401) {
            // For 401s where there is no refresh token, or retry already failed
            toast.error("Session expired. Please log in again.");
            removeFromSession("user");
        }

        return Promise.reject(error);
    }
);

export default api;
