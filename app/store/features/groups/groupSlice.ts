import { apiCall } from "@/app/service/apiCall";
import { ENDPOINTS } from "@/app/service/endpoints";
import { GroupData } from "@/app/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { logout } from "../users/userSlice";

// 1. Define State Shape
interface GroupState {
  data: GroupData | null;
  loading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchGroupData = createAsyncThunk<GroupData>(
  "group/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiCall<GroupData>({
        url: ENDPOINTS.TEST_APP.GROUP_INFO,
        method: "GET",
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    // Synchronous Action: Clear group data (e.g., on logout)
    clearGroupData: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchGroupData.fulfilled,
        (state, action: PayloadAction<GroupData>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchGroupData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout, (state) => {
        state.data = null;
        state.error = null;
        state.loading = false;
      });
  },
});

// Export Actions & Reducer
export const { clearGroupData } = groupSlice.actions;
export default groupSlice.reducer;
