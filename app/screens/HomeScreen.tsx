import React, { useCallback, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import {
  CameraControls,
  Cover,
  HomeScreenHeaders,
  WorldToggleButton,
} from "../components";

import Carousel from "react-native-reanimated-carousel";
import { scale } from "../utility/responsive";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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

// Size and layout
const FOOTER_HEIGHT = scale.m(308);
const HEADER_HEIGHT = scale.m(104);

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
  navigation: any;
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
  navigation,
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

  const carouselRef = useRef<any>(null);

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
        <Pressable onPress={() => navigation.navigate("Consumption")}>
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
        </Pressable>
      );
    },
    [currentVideoIndex, isScrolling],
  );

  const handleVideoCaptured = useCallback((path: string) => {
    console.log("Video captured:", path);
  }, []);

  return (
    <View style={styles.container}>
      <HomeScreenHeaders
        onBackPress={onBackPress}
        onStarPress={onStarPress}
        groupName={groupName}
        headerHeight={HEADER_HEIGHT}
        profileImage={profileImage}
      />

      <View
        style={{
          height: SCREEN_HEIGHT - FOOTER_HEIGHT - HEADER_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: scale.v(30),
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
      <CameraControls
        onFlashlightPress={onFlashlightPress}
        onRotateCameraPress={onRotateCameraPress}
        onVideoCaptured={handleVideoCaptured}
        navigation={navigation as any}
        footerHeight={FOOTER_HEIGHT}
      />

      <WorldToggleButton
        onPress={onWorldSwitcherPress}
        footerHeight={FOOTER_HEIGHT}
      />

      {/* <BlurBGCamera /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "black",
  },

  worldSwitcherContainer: {
    height: scale.m(256),
    alignItems: "center",
  },
});

export default HomeScreen;
