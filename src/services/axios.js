import axios from "axios";

export const AuthInstanceApi = axios.create({
  baseURL: "http://localhost:3005/v1/api/",
  headers: {
    "Content-Type": "application/json",
  }
});

export const UserInstanceApi = axios.create({
  baseURL: "http://localhost:3005/v1/api/",
  headers: {
    "Content-Type": "application/json",
  }
});

UserInstanceApi.interceptors.request.use(
  (config) => {
    // autentificacion con token en localStorage
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);