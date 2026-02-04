import type { BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxiosError, AxiosRequestConfig, Method } from "axios";
import axiosInstance from "./apiClient";

export const apiBaseQuery: BaseQueryFn<
  | {
      url: string;
      method?: Method;
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
      baseURL?: string;
    }
  | string,
  unknown,
  unknown
> = async (args, api, extraOptions) => {
  try {
    const result = await axiosInstance({
      ...(typeof args === "string" ? { url: args } : args),
    });
    return { data: result.data };
  } catch (axiosError) {
    const err = axiosError as AxiosError;
    return {
      error: {
        status: err.response?.status,
        data: err.response?.data || err.message,
      },
    };
  }
};
