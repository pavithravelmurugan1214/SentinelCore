import axios from "axios";

// Automatically use the same host/IP that opened the frontend.
// Example:
// Frontend: http://10.182.70.112:5173
// Backend : http://10.182.70.112:8080
const BACKEND_HOST = window.location.hostname;

export const API_BASE_URL =
    `http://${BACKEND_HOST}:8080/api`;

export const BACKEND_BASE_URL =
    `http://${BACKEND_HOST}:8080`;

console.log("Cloud Security API:", API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================

api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        // Do not attach JWT to authentication endpoints
        if (
            token &&
            config.url &&
            !config.url.includes("/auth/")
        ) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================

api.interceptors.response.use(

    (response) => response,

    async (error) => {

        const originalRequest = error.config;

        // Network/backend unavailable
        if (!error.response) {

            console.error(
                "Cloud Security backend connection failed:",
                error.message
            );

            return Promise.reject(error);
        }

        // ==========================================
        // REFRESH EXPIRED JWT
        // ==========================================

        if (
            error.response.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/login") &&
            !originalRequest.url?.includes("/auth/refreshtoken")
        ) {

            originalRequest._retry = true;

            try {

                const refreshToken =
                    localStorage.getItem("refreshToken");

                if (!refreshToken) {
                    throw new Error("Refresh token not available");
                }

                const response = await axios.post(
                    `${API_BASE_URL}/auth/refreshtoken`,
                    {
                        refreshToken
                    },
                    {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );

                const newAccessToken =
                    response.data.accessToken ||
                    response.data.token;

                if (!newAccessToken) {
                    throw new Error(
                        "New access token not returned"
                    );
                }

                localStorage.setItem(
                    "token",
                    newAccessToken
                );

                originalRequest.headers =
                    originalRequest.headers || {};

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(originalRequest);

            } catch (refreshError) {

                console.error(
                    "Session expired:",
                    refreshError
                );

                clearSession();

                // Your login route is currently /
                window.location.href = "/";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// ==========================================
// CLEAR SESSION
// ==========================================

function clearSession() {

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("isLoggedIn");

}

export default api;