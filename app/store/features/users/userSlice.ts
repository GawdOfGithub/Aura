import { ServerUserResponse } from "@/app/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useGetCurrentUserInfoQuery } from "./userApi";

// 1. Define State Shape
interface UserState {
  token: string | null;
  data: ServerUserResponse | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  token: null,
  data: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Synchronous Actions
    logout: (state) => {
      state.data = null;
      state.data = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    login: (
      state,
      action: PayloadAction<{ token: string; userData: ServerUserResponse }>,
    ) => {
      state.token = action.payload.token;
      state.data = action.payload.userData;
      state.isAuthenticated = true;
    },
  },
});

export const { login, logout } = userSlice.actions;

export const useGetCurrentUserId = () => {
  return useGetCurrentUserInfoQuery(undefined, {
    selectFromResult: ({ data }) => ({
      currentUserId: data?.id,
    }),
  });
};
export default userSlice.reducer;
