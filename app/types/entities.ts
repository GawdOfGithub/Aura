import { ImageSourcePropType } from "react-native";

export type AppUser = {
  id: string;
  name: string;
  profilePhoto: ImageSourcePropType;
};

export type VideoThumbnail = {
  videoId: string;
  imagePath: string | null; // here null will mean still generating
};

export type VideoNote = {
  id: string;
  videoPath: string;
  createdBy: AppUser;
  createdAt: string;
};

export type UserReaction = {
  id: string;
  emoji: string;
  user: AppUser;
};
