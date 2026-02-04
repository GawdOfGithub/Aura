import { ImageSourcePropType } from "react-native";
import {
  ServerBasePostResponse,
  ServerBaseUserResponse,
  ServerChatResponse,
  ServerUserResponse,
} from "./serverResponse";
import { Camelize } from "./utils";
// naming convention - App<entity>

export type AppUser = {
  id: string;
  name: string;
  profilePhoto: ImageSourcePropType;
};

export type VideoThumbnail = {
  videoId: string;
  imagePath: string | null; // here null will mean still generating
};

export type UserReaction = {
  id: string;
  emoji: string;
  user: AppUser;
};
// Starts from here , need to remove all above.
export type AppVideoCaptured = {
  id: string;
  videoPath: string;
};
export type AppBaseUser = Camelize<ServerBaseUserResponse>;

export type AppPost = Camelize<ServerBasePostResponse>;
export type VideoNote = Omit<AppPost, "createdBy" | "createdAt">;

export interface AppRelay {
  id: string;
  usersParticipated: AppBaseUser[];
  endTime: string;
  firstPost: AppPost;
  numberPosts: number;
}
export type AppChat = Omit<Camelize<ServerChatResponse>, "relays"> & {
  relays: AppRelay[] | null;
};
export type AppUserInfo = Camelize<ServerUserResponse>;
