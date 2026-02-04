// hooks/useAppData.ts
import {
  useChatInfo,
  useGetChatListQuery
} from "@/app/store/features/chats/chatApi";
import { setCurrentActiveChatId } from "@/app/store/features/chats/chatSlice";
import { useGetCurrentUserInfoQuery } from "@/app/store/features/users/userApi";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useLoadIntialData = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.user.token);
  const [isAppReady, setIsAppReady] = useState(false);

  // 1. Critical Data (Blocking)
  // We skip fetching if there is no token (user not logged in)
  //   const {
  //     data: user,
  //     isLoading: isUserLoading,
  //     isSuccess: isUserLoaded,
  //     isError: isUserError,
  //   } =
  useGetCurrentUserInfoQuery(undefined, { skip: !token });

  // 2. Background Data (Non-Blocking)
  // We just fire this off. We don't wait for it to hide the splash screen.
  const { data: chats, isSuccess: areChatsLoaded } = useGetChatListQuery(
    undefined,
    { skip: !token },
  );
  const firstChatId = chats?.[0]?.id ?? null; // need to change this
  console.log(firstChatId, "+");
  useEffect(() => {
    if (firstChatId) {
      console.log("Setting active chat:", firstChatId);
      dispatch(setCurrentActiveChatId(firstChatId));
    }
  }, [firstChatId, dispatch]);

  useChatInfo(firstChatId);

  //   useEffect(() => {
  //     // Logic: If user is not logged in, OR if user data is loaded (success or error)
  //     // Then the app is "Ready" to be shown.
  //     if (!token || isUserLoaded || isUserError) {
  //       setIsAppReady(true);
  //     }
  //   }, [token, isUserLoaded, isUserError]);

  //   return { isAppReady };
};
