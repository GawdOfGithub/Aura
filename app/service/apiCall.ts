import { AxiosRequestConfig } from "axios";
import axiosInstance from "./apiClient";

// Define the standard HTTP methods
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestParams {
  url: string;
  method?: HttpMethod;
  data?: any;
  params?: any;
  headers?: any;
}

/**
 * Universal API Handler
 * @param url - Endpoint (e.g., '/todos')
 * @param method - HTTP Method (default GET)
 * @param data - Request body
 * @param params - Query params
 */
export const apiCall = async <T>({
  url,
  method = "GET",
  data = null,
  params = null,
  headers = {},
}: ApiRequestParams): Promise<T> => {
  const config: AxiosRequestConfig = {
    method,
    url,
    headers: { ...headers },
  };
  if (data) {
    config.data = data;
  }
  if (params) {
    config.params = params;
  }
  try {
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};
