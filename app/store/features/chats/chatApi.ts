import { ENDPOINTS } from "@/app/service/endpoints";
import { AppBaseUser, AppChat, ServerChatResponse } from "@/app/types";
import { skipToken } from "@reduxjs/toolkit/query";
import camelcaseKeys from "camelcase-keys";
import { api } from "../../apiSlice";

export const chatAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getChatList: builder.query<AppChat[], void>({
      query: () => ({
        url: ENDPOINTS.CHAT.CHAT_LIST,
        method: "GET",
      }),
      // The library handles the nested 'members' and 'created_by' automatically
      transformResponse: (response: ServerChatResponse[]) => {
        return camelcaseKeys(response, { deep: true }) as AppChat[];
      },
      providesTags: (result) =>
        result
          ? [
              { type: "Chat", id: "LIST" },
              ...result.map(({ id }) => ({ type: "Chat" as const, id })),
            ]
          : [{ type: "Chat", id: "LIST" }],
    }),
    getChatInfo: builder.query<AppChat, string>({
      query: (chatId) => ({
        url: ENDPOINTS.CHAT.CHAT_INFO(chatId),
        method: "GET",
      }),
      transformResponse: (response: ServerChatResponse) => {
        const detailedChat = camelcaseKeys(response, { deep: true });
        console.log(detailedChat, "detailedChatdetailedChatdetailedChat");
        const userMap = new Map<string, AppBaseUser>();
        const members = detailedChat.members || [];
        members.forEach((user: AppBaseUser) => {
          userMap.set(user.id, user);
        });
        //Rehydrate the Relays
        if (detailedChat.relays) {
          detailedChat.relays = detailedChat.relays.map((relay: any) => ({
            ...relay,
            usersParticipated: relay.usersParticipated
              .map((userId: string) => userMap.get(userId))
              .filter(Boolean),
          }));
        }
        return detailedChat as AppChat;
      },
      providesTags: (result, error, chatId) => [{ type: "Chat", id: chatId }],
    }),
  }),
});

export const useChatInfo = (chatId: string | null | undefined) => {
  // 2. Automatically switch to 'skipToken' if ID is missing
  return useGetChatInfoQuery(chatId ?? skipToken);
};

export const { useGetChatListQuery, useGetChatInfoQuery } = chatAPI;
