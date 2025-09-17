import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function fakeApiLogin(email: string, password: string) {
  return new Promise<any>((resolve, reject) => {
    setTimeout(() => {
      if (email === "test@example.com" && password === "password123") {
        resolve({
          id: "1",
          name: "Test User",
          email: "test@example.com",
          phoneNumber: "123-456-7890",
          userType: "student",
        });
      } else {
        reject(new Error("Invalid email or password"));
      }
    }, 1000);
  });
}

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);
