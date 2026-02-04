import { RootState } from "@/app/store"; // Adjust path to your store
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useGetChatInfoQuery } from "./chatApi";

interface ChatState {
  currentActiveChatId: string | null;
}

const initialState: ChatState = {
  currentActiveChatId: null,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Call this when user taps a group in the list
    setCurrentActiveChatId: (state, action: PayloadAction<string | null>) => {
      if (action.payload) state.currentActiveChatId = action.payload;
    },
    // Call this when unmounting the group screen (optional cleanup)
    clearActiveChatId: (state) => {
      state.currentActiveChatId = null;
    },
  },
});

export const { setCurrentActiveChatId, clearActiveChatId } = chatSlice.actions;

// Selector for easy access in components
export const selectCurrentActiveChatId = (state: RootState) =>
  state.chat.currentActiveChatId;

export const useGetRelayFromChat = (chatId: string, relayId: string) => {
  return useGetChatInfoQuery(chatId, {
    skip: !chatId,

    selectFromResult: ({ data, isLoading, isFetching }) => {
      // 1. find the specific relay in the cached chat data
      const relay = data?.relays?.find((r) => r.id === relayId);
      return {
        relay,
        isLoading: isLoading,
      };
    },
  });
};

export default chatSlice.reducer;
