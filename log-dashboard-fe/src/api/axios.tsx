import baseUrl from "@/utils/BaseURL";
import axios from "axios";
console.log(baseUrl);
export const api = axios.create({
  headers: {
    "Access-Control-Allow-Origin": "*",
    // "Content-Type": "application/json",
  },
});

export const interceptors = () => {
  api.interceptors.request.use(
    (config) => {
      config.baseURL = baseUrl;
      config.withCredentials = true;
      return config;
    },
    (error) => Promise.reject(error)
  );
};
