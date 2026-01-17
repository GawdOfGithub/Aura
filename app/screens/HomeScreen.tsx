import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Carousel from "react-native-reanimated-carousel";
import {
  CameraControls,
  Cover,
  HomeScreenHeaders,
  RelayController,
  WorldToggleButton,
} from "../components";
import { useThumbnailGenerator } from "../hooks/useThumbnailGenerator";
import { useVideoPreloader } from "../hooks/useVideoPreloader";
import { VideoItem } from "../testApp/components/VideoBubbleCarousel";
import { scale } from "../utility/responsive";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const FOOTER_HEIGHT = scale.v(300);
const EACH_VIDEO_HEIGHT = scale.m(500);

const jayshankarVideo = require("../assets/videos/jayshankar.mp4");
const imgImage465 = require("../assets/images/png/test_image.png");

const imgVideoMsgLayer = require("../assets/images/png/test_image.png");
const imgImg7338 = require("../assets/images/png/test_image.png");

const getRelayEndTime = (offsetMinutes: number): string => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + offsetMinutes);
  return date.toISOString();
};

const PUBLIC_VIDEOS = [
  // Short videos (under 10 seconds each)
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
];

const TEST_VIDEOS = [
  {
    videoSource: PUBLIC_VIDEOS[0],
    relayEndTime: getRelayEndTime(15000),
    newCount: 3,
    users: [
      { id: "1", name: "User 1", dp: imgImage465 },
      { id: "2", name: "User 2", dp: imgImage465 },
    ],
  },
  {
    videoSource: PUBLIC_VIDEOS[1],
    relayEndTime: getRelayEndTime(5),
    newCount: 2,
    users: [{ id: "3", name: "User 3", dp: imgImage465 }],
  },
  {
    videoSource: PUBLIC_VIDEOS[2],
    relayEndTime: getRelayEndTime(-15),
    newCount: 5,
    users: [
      { id: "6", name: "User 6", dp: imgImage465 },
      { id: "7", name: "User 7", dp: imgImage465 },
    ],
  },
  {
    videoSource: PUBLIC_VIDEOS[3],
    relayEndTime: getRelayEndTime(-30),
    newCount: 4,
    users: [{ id: "8", name: "User 8", dp: imgImage465 }],
  },
  {
    videoSource: PUBLIC_VIDEOS[4],
    relayEndTime: getRelayEndTime(-90),
    newCount: 1,
    users: [
      { id: "9", name: "User 9", dp: imgImage465 },
      { id: "10", name: "User 10", dp: imgImage465 },
    ],
  },
  {
    videoSource: PUBLIC_VIDEOS[5],
    relayEndTime: getRelayEndTime(-180),
    newCount: 6,
    users: [{ id: "13", name: "User 13", dp: imgImage465 }],
  },
];

interface User {
  id: string;
  name: string;
  dp: any;
}

export interface VideoData {
  videoSource: any;
  relayEndTime: string;
  newCount?: number;
  users: User[];
}

interface HomeScreenProps {
  videos?: VideoData[];
  initialIndex?: number;
  onBackPress?: () => void;
  onStarPress?: () => void;
  onFlashlightPress?: () => void;
  onRotateCameraPress?: () => void;
  onWorldSwitcherPress?: () => void;
  groupName?: string;
  profileImage?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  videos = TEST_VIDEOS,
  initialIndex = 0,
  onBackPress,
  onStarPress,
  onFlashlightPress,
  onRotateCameraPress,
  onWorldSwitcherPress,
  groupName,
  profileImage,
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(initialIndex);
  const [isScrolling, setIsScrolling] = useState(false);

  const videoItems = useMemo(
    () =>
      videos.map((video, index) => ({
        id: `video-${index}`,
        videoUri: video.videoSource,
      })),
    [videos],
  );

  const { thumbnails, getThumbnail, isGenerating } = useThumbnailGenerator({
    videos: videoItems,
    currentIndex: currentVideoIndex,
    lookahead: videos.length,
  });

  const { preloadedIndices, isPreloading } = useVideoPreloader({
    videos: videoItems,
    currentIndex: currentVideoIndex,
    isScrolling,
    lookahead: 2,
  });

  const carouselRef = useRef<any>(null);

  const bubbleVideoItems: VideoItem[] = useMemo(
    () =>
      videos.map((video, index) => {
        const thumbnail = getThumbnail(`video-${index}`);
        return {
          id: `video-${index}`,
          videoUri: video.videoSource,
          createdBy: video.users[0]?.name || `User ${index + 1}`,
          thumbnailUri: thumbnail || undefined,
        };
      }),
    [videos, getThumbnail],
  );

  const handleBubbleIndexChange = useCallback((index: number) => {
    setCurrentVideoIndex(index);
    carouselRef.current?.scrollTo({ index, animated: true });
  }, []);

  const STATE_COMBINATIONS = [
    { relay: "live" as const, sub: "unseen" as const },
    { relay: "live" as const, sub: "seen" as const },
    { relay: "ended" as const, sub: "unseen" as const },
    { relay: "ended" as const, sub: "seen" as const },
    { relay: "missed" as const, sub: "unseen" as const },
    { relay: "missed" as const, sub: "seen" as const },
  ];

  const renderVideoItem = useCallback(
    ({ item, index }: { item: VideoData; index: number }) => {
      const stateForBubble =
        STATE_COMBINATIONS[index % STATE_COMBINATIONS.length];

      return (
        <Cover
          videoSource={item.videoSource}
          relayEndTime={item.relayEndTime}
          newCount={item.newCount}
          relayState={stateForBubble.relay}
          subState={stateForBubble.sub}
          isActive={index === currentVideoIndex}
          isScrolling={isScrolling}
          shouldBlur={false} // Disabled blur for testing clarity
          users={item.users}
        />
      );
    },
    [currentVideoIndex, isScrolling],
  );

  const navigation = useNavigation();

  const handleVideoCaptured = useCallback((path: string) => {
    console.log("Video captured:", path);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View
        style={{
          position: "absolute",
          top: scale.v(106),
        }}
      >
        <Image
          resizeMode="cover"
          source={require("../assets/images/png/background_pattern.png")}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: SCREEN_WIDTH + 50,
            height: scale.m(600),
            zIndex: -100,
            opacity: 0.45,
          }}
        />
      </View>

      <HomeScreenHeaders
        onBackPress={onBackPress}
        onStarPress={onStarPress}
        groupName={groupName}
        profileImage={profileImage}
      />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginTop: scale.v(50),
        }}
      >
        <Carousel
          ref={carouselRef}
          loop={true}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT - scale.v(370)}
          vertical={true}
          data={videos}
          renderItem={renderVideoItem}
          onScrollStart={() => setIsScrolling(true)}
          onScrollEnd={(index) => {
            setCurrentVideoIndex(index);
            setIsScrolling(false);
          }}
          style={{ flex: 1 }}
        />
      </View>

      <View style={styles.worldSwitcherContainer} pointerEvents="box-none">
        <LinearGradient
          colors={["rgba(16,16,16, 0)", "rgba(16, 16, 16, 1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <CameraControls
          onFlashlightPress={onFlashlightPress}
          onRotateCameraPress={onRotateCameraPress}
          onVideoCaptured={handleVideoCaptured}
          navigation={navigation as any}
        />
        <WorldToggleButton onPress={onWorldSwitcherPress} />
      </View>

      <RelayController
        activeIndex={currentVideoIndex}
        totalItems={videos.length}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#000000",
  },

  worldSwitcherContainer: {
    height: scale.v(256),
    alignItems: "center",
  },
});

export default HomeScreen;
