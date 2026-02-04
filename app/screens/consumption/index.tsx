import { CameraControls } from "@/app/components";
import StashEmojiBottomPanel from "@/app/components/consumption/StashEmojiBottomPanel";
import EmojiKeyBoard from "@/app/components/emoji-keyboard";
import { TimelineCarousel } from "@/app/components/timeline-carousel";
import ConsumptionVideoContainer from "@/app/components/videos/ConsumptionVideo";
import { useRelayState } from "@/app/hooks/useRelayState";
import useThumbnailGenerator from "@/app/hooks/useThumbnailGenerator";
import { useGetRelayFromChat } from "@/app/store/features/chats/chatSlice";
import { useGetRelayPostsQuery } from "@/app/store/features/posts/postsApi";
import { useGetCurrentUserId } from "@/app/store/features/users/userSlice";
import { AppPost } from "@/app/types";
import { scale } from "@/app/utility/responsive";
import { getVideoHeightFromWidth } from "@/app/utility/videoSizeInfo";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { EmojiType } from "rn-emoji-keyboard";

const { width, height } = Dimensions.get("window");
const ITEM_HEIGHT = getVideoHeightFromWidth();
//videoId to be added when live is there
export const CREATE_VIDEO_NOTE = "CREATE_VIDEO_NOTE";

const Consumption = ({ route }: any) => {
  const navigation = useNavigation();
  const { chatId, relayId } = route.params;
  const { data: posts } = useGetRelayPostsQuery({ chatId, relayId });
  const [isEmojiKeyboardOpen, setIsEmojiKeyboardOpen] =
    useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiType | null>(null);
  const mainCarouselRef = useRef<ICarouselInstance>(null);
  const timelineCarouselRef = useRef<ICarouselInstance>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { currentUserId } = useGetCurrentUserId();
  const { relay, isLoading } = useGetRelayFromChat(chatId, relayId);
  const relayState = useRelayState({ chatId, relayId, currentUserId });

  const visualFeed: AppPost[] = useMemo(() => {
    if (!posts) return [];

    const feed = [...posts];
    if (relayState === "live") {
      feed.push({
        id: CREATE_VIDEO_NOTE,
        type: "create_card",
      } as any);
    }

    return feed;
  }, [posts, relayState]);

  const videoNotes = useMemo(() => {
    if (visualFeed)
      return visualFeed
        .filter((item) => item.id != CREATE_VIDEO_NOTE)
        .map((post) => {
          const { createdBy, createdAt, ...rest } = post;
          return rest;
        });
    return [];
  }, [visualFeed]);

  const { getThumbnail, cacheVersion } = useThumbnailGenerator({
    videos: videoNotes,
    timePosition: 1000,
    concurrencyLimit: 2, // Only generate 2 at a time
  });
  const thumbnailData = useMemo(() => {
    if (visualFeed) {
      let thumbnailPostMap = visualFeed.map((item) => {
        if (item.id === CREATE_VIDEO_NOTE) {
          return {
            videoId: CREATE_VIDEO_NOTE,
            imagePath: null,
          };
        }
        const thumb = getThumbnail(item.id);
        return thumb || { videoId: item.id, imagePath: null };
      });

      return thumbnailPostMap;
    }
    return [];
  }, [visualFeed, getThumbnail, cacheVersion, relayState]);
  const onMainSnap = (index: number) => {
    setActiveIndex(index);
    // Sync Timeline to Main
    timelineCarouselRef.current?.scrollTo({ index, animated: true });
  };
  const onTimelineSnap = (index: number) => {
    setActiveIndex(index);
    mainCarouselRef.current?.scrollTo({ index, animated: true });
  };
  return (
    <View style={styles.container}>
      <Carousel
        ref={mainCarouselRef}
        loop={false}
        width={width}
        height={ITEM_HEIGHT}
        data={visualFeed}
        defaultIndex={activeIndex}
        scrollAnimationDuration={500} // Faster snap feels snappier
        onSnapToItem={onMainSnap}
        // Critical for performance:
        // 3 items rendered in tree: Prev, Current, Next
        // windowSize={3}
        renderItem={({ item, index }) => {
          // LOGIC: Preload previous and next, but only play current
          const isFocused = index === activeIndex;
          const shouldLoad = Math.abs(activeIndex - index) <= 1;

          return (
            <ConsumptionVideoContainer
              relayState={relayState}
              videoPost={item}
              videoSeenData={[]} // integrate VideoReaction here
              isFocused={isFocused}
              shouldLoad={shouldLoad}
              relayEndTime={relay?.endTime ?? ""}
            />
          );
        }}
      />
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
        <TimelineCarousel
          data={thumbnailData}
          activeIndex={activeIndex}
          ref={timelineCarouselRef}
          onSnapToItem={onTimelineSnap}
        />
      </LinearGradient>
      <StashEmojiBottomPanel
        onEmojiClick={() => {
          setIsEmojiKeyboardOpen(true);
        }}
        onStashClick={() => {}}
      />
      <CameraControls
        chatId={chatId}
        cameraWrapperPositionFromBottom={scale.m(140)}
      />
      <EmojiKeyBoard
        isOpen={isEmojiKeyboardOpen}
        onClose={() => {
          setIsEmojiKeyboardOpen(false);
        }}
        onEmojiSelected={(emoji: EmojiType) => {
          setSelectedEmoji(emoji);
          setIsEmojiKeyboardOpen(false);
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
