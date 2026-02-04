import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../service/apiBaseQuery";

export const api = createApi({
  baseQuery: apiBaseQuery,
  reducerPath: "api",
  tagTypes: ["General", "Chat", "User", "Posts"],
  endpoints: () => ({}),
});
