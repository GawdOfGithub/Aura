const BASE_URL = "https://houseless-ashley-reflectingly.ngrok-free.dev";
//export const BASE_URL = "https://cam.dropapp.in";

export const OTPRequestCreateURL = () => {
  return `${BASE_URL}/users/otp-request-create?dev=true`;
};

export const GroupInfoURL = () => {
  return `${BASE_URL}/test-app/group`;
};

export const GeneratePresignedURL = () => {
  return `${BASE_URL}/test-app/get-presigned-url`;
};

export const SendVideoURL = () => {
  return `${BASE_URL}/test-app/send-video`;
};
