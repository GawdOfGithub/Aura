import { GroupData } from "../../../types";
import { api } from "../../apiSlice";

export const groupsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGroupInfo: builder.query<GroupData, void>({
      query: () => ({
        url: "/test-app/group",
        method: "GET",
      }),
      providesTags: [{ type: "General", id: "Group" }],
    }),
    updateGroup: builder.mutation<GroupData, Partial<GroupData>>({
      query: (body) => ({
        url: "/test-app/group",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "General", id: "Group" }],
    }),
  }),
});

export const { useGetGroupInfoQuery, useLazyGetGroupInfoQuery, useUpdateGroupMutation } = groupsApi;

