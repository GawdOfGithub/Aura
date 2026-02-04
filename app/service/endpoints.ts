export const BASE_URL = () => {
  // if (__DEV__) {
  //   return "https://houseless-ashley-reflectingly.ngrok-free.dev/v2/";
  // }
  return "https://cam.dropapp.in/v2/";
};

export const BASE_URL_BARE = () => {
  // if (__DEV__) {
  //   return "https://houseless-ashley-reflectingly.ngrok-free.dev/";
  // }
  return "https://cam.dropapp.in/";
};
export const ENDPOINTS = {
  USERS: {
    OTP_REQUEST: "users/otp-request-create",
    OWN_USER: "users/me",
  },
  CHAT: {
    CHAT_LIST: "chats/list",
    CHAT_INFO: (chatId: string) => `chats/${chatId}`,
  },
  POST: {
    GET_PRESIGNED_URL: "posts/get-presigned-url",
    CREATE_POST: "posts/create",
    GET_POSTS: (chatId: string, relayId: string) =>
      `chats/${chatId}/relays/${relayId}/posts`,
  },
  TEST_APP: {
    GROUP_INFO: "/test-app/group",
    GET_PRESIGNED_URL: "/test-app/get-presigned-url",
    SEND_VIDEO: "/test-app/send-video",
  },
};
