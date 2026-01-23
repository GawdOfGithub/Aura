import EmojiKeyBoard from "@/app/components/emoji-keyboard";
import VideoOverlayText from "@/app/components/text-components/VideoOverlayText";
import StaticTimeAgo from "@/app/components/time/StaticTime";
import { TimelineCarousel } from "@/app/components/timeline-carousel";
import AppVideoPlayer from "@/app/components/videos/AppVideoPlayer";
import useThumbnailGenerator from "@/app/hooks/useThumbnailGenerator";
import { scale } from "@/app/utility/responsive";
import { formatTime12hWithDay } from "@/app/utility/timeFuctions";
import { getVideoHeightFromWidth } from "@/app/utility/videoSizeInfo";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { EmojiType } from "rn-emoji-keyboard";

const videoData = [
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
const videoSource =
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4";
const videos = [{ videoUri: videoSource, id: "xyz" }];
const Consumption = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiType | null>(null);
  const { thumbnails, getThumbnail } = useThumbnailGenerator({
    videos,
    currentIndex: 1,
  });

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <AppVideoPlayer
          thumbnailSource={getThumbnail("xyz")}
          source={videoSource}
          style={StyleSheet.absoluteFillObject}
          shouldLoad={false}
          shouldPlay
        />
        <VideoOverlayText text="Aditya" />
        <StaticTimeAgo
          relayState="live"
          inputTime="2026-01-14T11:33:20.482910Z"
        />
        <VideoOverlayText
          text={formatTime12hWithDay("2026-01-14T11:33:20.482910Z")}
        />
      </View>

      <LinearGradient
        colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 1)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.32 }}
        style={{
          width: "100%",
          bottom: 0,
          position: "absolute",
          height: scale.m(270),
        }}
      >
        <TimelineCarousel data={videoData} />
      </LinearGradient>
      <EmojiKeyBoard
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        onEmojiSelected={(emoji: EmojiType) => {
          setSelectedEmoji(emoji);
          setIsOpen(false);
        }}
      />
    </View>
  );
};

export default Consumption;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    height: getVideoHeightFromWidth(),
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContainer: {
    flex: 1,
  },
});
