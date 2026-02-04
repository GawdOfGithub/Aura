import { combineReducers, configureStore, Middleware } from "@reduxjs/toolkit";
import {
  createTransform,
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
import { mmkvReduxStorage } from "../storage/mmkvStorage";
import { api } from "./apiSlice";
import chatReducer from "./features/chats/chatSlice";
import videoReducer from "./features/groups/groupPostsSlice";
import groupReducer from "./features/groups/groupSlice";
import uploadReducer from "./features/upload/uploadSlice";
import userReducer from "./features/users/userSlice";
const PERSISTED_QUERY_PREFIXES = ["getGroupInfo"];

const apiTransform = createTransform(
  (inboundState: any) => {
    if (!inboundState?.queries) return inboundState;

    const filteredQueries: any = {};
    Object.keys(inboundState.queries).forEach((key) => {
      const shouldPersist = PERSISTED_QUERY_PREFIXES.some((prefix) =>
        key.startsWith(prefix),
      );

      if (shouldPersist) {
        filteredQueries[key] = inboundState.queries[key];
      }
    });

    return {
      ...inboundState,
      queries: filteredQueries,
      mutations: {},
      subscriptions: {},
    };
  },

  (outboundState: any) => outboundState,
  { whitelist: ["api"] },
);

const persistConfig = {
  key: "root",
  storage: mmkvReduxStorage,
  whitelist: ["user", "api"],
  transforms: [apiTransform],
};

const rootReducer = combineReducers({
  user: userReducer,
  group: groupReducer,
  upload: uploadReducer,
  videos: videoReducer,
  chat: chatReducer,
  [api.reducerPath]: api.reducer,
});

// 3. Create Persisted Reducer
const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

// 4. Configure Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware as Middleware),
});

injectStore(store);
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
