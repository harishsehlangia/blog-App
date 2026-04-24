import axios from 'axios';
import { lookInSession } from './session';
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

// Global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.error || error.message || "Something went wrong";
        const status = error.response?.status;

        // Show toast for server errors (skip if caller handles it manually)
        if (status === 401) {
            toast.error("Session expired. Please log in again.");
        } else if (status === 429) {
            toast.error("Too many requests. Please slow down.");
        } else if (status >= 500) {
            toast.error("Server error. Please try again later.");
        }

        return Promise.reject(error);
    }
);

export default api;
