import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8001/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor — attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("adminToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (token expired/invalid)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't redirect if already on login-related endpoints
            const url = error.config?.url || "";
            if (!url.includes("/auth/login") && !url.includes("/auth/me")) {
                localStorage.removeItem("adminToken");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
