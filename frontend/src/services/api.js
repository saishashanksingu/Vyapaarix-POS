import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || (
    import.meta.env.PROD ? "/api" : "http://localhost:5000/api"
);

const API = axios.create({
    baseURL
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;
