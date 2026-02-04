import axios from "axios";
import { BASE_URL } from "./endpoints";
// import { store } from "../store";
// import { logout } from "../store/features/users/userSlice";

let store: any;
export const injectStore = (_store: any) => {
  store = _store;
};

const axiosInstance = axios.create({
  baseURL: BASE_URL(),
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (store) {
      const state = store.getState();
      const token = state.user?.token;
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
      console.log(token, "token");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log(error.response);
    // Handle 401 (Unauthorized) - e.g., Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("Session expired. Logging out...");
      if (store) {
        store.dispatch({ type: "user/logout" });
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
