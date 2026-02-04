import { BASE_URL, ENDPOINTS } from "@/app/service/endpoints";
import { AppUserInfo, ServerUserResponse } from "@/app/types";
import camelcaseKeys from "camelcase-keys";
import { api } from "../../apiSlice";

export const userAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUserInfo: builder.query<AppUserInfo, void>({
      query: () => ({
        url: ENDPOINTS.USERS.OWN_USER,
        method: "GET",
        baseURL: BASE_URL(),
      }),
      // The library handles the nested 'members' and 'created_by' automatically
      transformResponse: (response: ServerUserResponse) => {
        return camelcaseKeys(response, { deep: true }) as AppUserInfo;
      },
      providesTags: ["User"],
    }),
  }),
});

export const { useGetCurrentUserInfoQuery } = userAPI;
