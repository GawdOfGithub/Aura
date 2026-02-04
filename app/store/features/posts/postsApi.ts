import { BASE_URL, ENDPOINTS } from "@/app/service/endpoints";
import {
  AppPost,
  CreatePostResponse,
  ServerBasePostResponse,
} from "@/app/types"; // Define these types
import camelcaseKeys from "camelcase-keys";
import { api } from "../../apiSlice";

interface GetRelayPostsArgs {
  chatId: string;
  relayId: string;
}

interface CreatePostArg {
  camera_id: string;
  s3_path: string;
  file_type?: string;
  reference_id: string;
}
export const postAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    // The Endpoint for fetching posts
    getRelayPosts: builder.query<AppPost[], GetRelayPostsArgs>({
      query: ({ chatId, relayId }) => ({
        url: ENDPOINTS.POST.GET_POSTS(chatId, relayId),
        method: "GET",
        baseURL: BASE_URL(),
      }),

      // Transform the list directly
      transformResponse: (response: ServerBasePostResponse[]) => {
        return camelcaseKeys(response, { deep: true }) as AppPost[];
      },

      // Smart Caching:
      // If we add a post to this relay later, we just invalidate
      // { type: 'RelayPosts', id: relayId }
      // TBD
      providesTags: (result, error, { relayId }) => [
        { type: "Posts", id: relayId },
      ],
    }),
    addPost: builder.mutation<CreatePostResponse, CreatePostArg>({
      query: (payload) => {
        console.log("Sending to Server:", payload);
        return {
          url: ENDPOINTS.POST.CREATE_POST,
          method: "POST",
          data: payload,
          baseURL: BASE_URL(),
        };
      },

      invalidatesTags: (result, error, arg) => {
        // Safety check: if the request failed, result is undefined
        if (!result) return [];

        return [
          // Invalidate the specific Relay returned by the server
          { type: "Posts", id: result.relay_id },

          // Invalidate the Chat Group (to update 'last active' or list)
          { type: "Chat", id: arg.camera_id },
        ];
      },
    }),
  }),

  overrideExisting: false, // Standard safety setting
});

export const { useGetRelayPostsQuery, usePrefetch, useAddPostMutation } =
  postAPI;
