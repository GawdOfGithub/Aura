import { popularEmojis } from "../components/emoji-keyboard/popularEmojis";
import { PUBLIC_VIDEOS } from "../screens/HomeScreen";
import { AppUser, UserReaction, VideoNote } from "../types";

export const UserData: AppUser[] = [
  {
    id: "abc1",
    name: "Aryan",
    profilePhoto: require("../assets/images/png/dummyImage/1.png"),
  },
  {
    id: "abc2",
    name: "Bharat",
    profilePhoto: require("../assets/images/png/dummyImage/2.png"),
  },
  {
    id: "abc3",
    name: "Aditya",
    profilePhoto: require("../assets/images/png/dummyImage/3.png"),
  },
  {
    id: "abc4",
    name: "Shivanshi",
    profilePhoto: require("../assets/images/png/dummyImage/4.png"),
  },
];

export const videoData = [
  {
    id: "xyz",
    image: "https://picsum.photos/id/27/200/300",
  },
  {
    id: "xyz",
    image: "https://picsum.photos/id/27/200/300",
  },
  {
    id: "xyz",
    image: "https://picsum.photos/id/27/200/300",
  },
  {
    id: "xyz",
    image: "https://picsum.photos/id/27/200/300",
  },
  {
    id: "xyz",
    image: "https://picsum.photos/id/27/200/300",
  },
];

export const VideosData: VideoNote[] = Array.from({ length: 6 }).map(
  (_, index) => {
    const randomUser = UserData[Math.floor(Math.random() * UserData.length)];
    const randomVideo =
      PUBLIC_VIDEOS[Math.floor(Math.random() * PUBLIC_VIDEOS.length)];

    return {
      id: `video-note-${index + 1}`,
      videoPath: randomVideo,
      createdBy: randomUser,
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000), // last 7 days
      ).toISOString(),
    };
  },
);

export const UserReactions: UserReaction[] = UserData.map((user, index) => {
  const randomEmoji =
    popularEmojis[Math.floor(Math.random() * popularEmojis.length)];

  return {
    id: `reaction-${user.id}-${Date.now()}-${index}`, // unique enough for dev
    emoji: randomEmoji.emoji,
    user,
  };
});
