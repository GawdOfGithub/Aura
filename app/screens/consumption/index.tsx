import EmojiKeyBoard from "@/app/components/emoji-keyboard";
import { TimelineCarousel } from "@/app/components/timeline-carousel";
import ConsumptionVideoContainer from "@/app/components/videos/ConsumptionVideo";
import useThumbnailGenerator from "@/app/hooks/useThumbnailGenerator";
import { scale } from "@/app/utility/responsive";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
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

const { width, height } = Dimensions.get("window");
const Consumption = () => {
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiType | null>(null);
  const videoSource =
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4";
  const videos = [{ videoPath: videoSource, videoId: "xyz" }];
  const { thumbnails, getThumbnail } = useThumbnailGenerator({
    videos,
    currentIndex: 1,
  });
  return (
    <View style={styles.container}>
      <ConsumptionVideoContainer videoItem={videos[0]} />
      {/* <CameraControls cameraWrapperPositionFromBottom={scale.m(138)} /> */}
      <LinearGradient
        colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 1)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.32 }}
        style={{
          width: "100%",
          bottom: 0,
          position: "absolute",
          zIndex: 0,
          justifyContent: "flex-end",
          paddingBottom: scale.v(25),
          height: scale.m(260),
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

  bottomContainer: {
    flex: 1,
  },
});
