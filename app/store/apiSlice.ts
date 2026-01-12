import { createApi } from "@reduxjs/toolkit/query";
import { apiBaseQuery } from "../service/apiBaseQuery";

export const api = createApi({
  baseQuery: apiBaseQuery,
  reducerPath: "api",
  tagTypes: ["General"],
  endpoints: () => ({}),
});
