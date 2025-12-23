import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import { injectStore } from "../service/apiClient";
import groupReducer from "./features/groups/groupSlice";
import userReducer from "./features/users/userSlice";

// 1. Persist Config
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["user"], // Things you want to save
  // blacklist: ['somethingTemporary'], // Things you DON'T want to save
};

// 2. Combine Reducers
const rootReducer = combineReducers({
  user: userReducer,
  group: groupReducer,
});

// 3. Create Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Configure Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

injectStore(store);
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
