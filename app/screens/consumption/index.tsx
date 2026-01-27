import EmojiKeyBoard from "@/app/components/emoji-keyboard";
import { TimelineCarousel } from "@/app/components/timeline-carousel";
import ConsumptionVideoContainer from "@/app/components/videos/ConsumptionVideo";
import useThumbnailGenerator from "@/app/hooks/useThumbnailGenerator";
import { UserReactions, VideosData } from "@/app/service/dummyData";
import { scale } from "@/app/utility/responsive";
import { getVideoHeightFromWidth } from "@/app/utility/videoSizeInfo";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { EmojiType } from "rn-emoji-keyboard";

const { width, height } = Dimensions.get("window");
const ITEM_HEIGHT = getVideoHeightFromWidth();
const Consumption = () => {
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiType | null>(null);
  const videoSource =
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4";
  const videos = VideosData;
  const [activeIndex, setActiveIndex] = useState(0);

  const { getThumbnail, cacheVersion } = useThumbnailGenerator({
    videos,
    currentIndex: 0,
    timePosition: 2000,
    concurrencyLimit: 3, // Only generate 3 at a time
  });
  const thumbnailData = useMemo(() => {
    return videos.map((video) => {
      const thumb = getThumbnail(video.id);
      return thumb || { videoId: video.id, imagePath: null };
    });
  }, [videos, getThumbnail, cacheVersion]);
  return (
    <View style={styles.container}>
      <Carousel
        loop={false}
        width={width}
        height={ITEM_HEIGHT}
        data={videos}
        scrollAnimationDuration={500} // Faster snap feels snappier
        onSnapToItem={(index) => setActiveIndex(index)}
        // Critical for performance:
        // 3 items rendered in tree: Prev, Current, Next
        windowSize={3}
        renderItem={({ item, index }) => {
          // LOGIC: Preload previous and next, but only play current
          const isFocused = index === activeIndex;
          const shouldLoad = Math.abs(activeIndex - index) <= 1;

          return (
            <ConsumptionVideoContainer
              videoItem={item}
              videoSeenData={UserReactions}
              isFocused={isFocused}
              shouldLoad={shouldLoad}
            />
          );
        }}
      />
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
        <TimelineCarousel data={thumbnailData} />
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
