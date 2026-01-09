import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  selectIsVideoLoading,
  selectVideosLast24Hours,
  syncRemoteVideos,
} from "../store/features/groups/groupPostsSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { SeamlessCamera } from "./cameraSceen";
import {
  VideoBubbleCarousel,
  VideoItem,
} from "./components/VideoBubbleCarousel";
import { useGroupData } from "./hooks";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");
const SMALL_WIDTH = 90;
const SMALL_HEIGHT = 90;
const SMALL_BOTTOM = 25;
const SMALL_LEFT = (WINDOW_WIDTH - SMALL_WIDTH) / 2;

// Main Video Player Height
const VIDEO_PLAYER_HEIGHT = WINDOW_HEIGHT * 0.42;

// TEST DATA - 5 real videos + 25 empty placeholders = 30 total
const TEST_VIDEO_SOURCE = require("../../assets/jayshankar.mp4");

const generateTestVideos = (): VideoItem[] => {
  const videos: VideoItem[] = [];

  // First 5 with actual video content
  const names = ["Jay Shankar", "Anurag", "Shashank", "Rahul", "Priya"];
  for (let i = 0; i < 5; i++) {
    videos.push({
      id: `video-${i}`,
      videoUri: TEST_VIDEO_SOURCE,
      createdBy: names[i],
      isEmpty: false,
    });
  }

  // Next 25 empty placeholders
  const emptyNames = [
    "User 6", "User 7", "User 8", "User 9", "User 10",
    "User 11", "User 12", "User 13", "User 14", "User 15",
    "User 16", "User 17", "User 18", "User 19", "User 20",
    "User 21", "User 22", "User 23", "User 24", "User 25",
    "User 26", "User 27", "User 28", "User 29", "User 30",
  ];
  for (let i = 0; i < 25; i++) {
    videos.push({
      id: `empty-${i}`,
      videoUri: null,
      createdBy: emptyNames[i],
      isEmpty: true,
    });
  }

  return videos;
};

// Generate once outside component
const TEST_VIDEOS = generateTestVideos();

const TestAppHomeScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { data: userData } = useAppSelector((state) => state.user);
  const { groupData } = useGroupData();
  const isLoading = useAppSelector(selectIsVideoLoading);
  const recentVideos = useAppSelector(selectVideosLast24Hours);

  // Active video index
  const [activeIndex, setActiveIndex] = useState(0);
  const activeVideo = TEST_VIDEOS[activeIndex];

  // Track if this is the first render
  const isFirstRender = useRef(true);

  // Main video player - only play if video has content
  const player = useVideoPlayer(
    activeVideo?.isEmpty ? null : TEST_VIDEO_SOURCE,
    (p) => {
      p.loop = false;
      p.muted = true;
      p.volume = 1;
      if (!activeVideo?.isEmpty) {
        p.play();
      }
    }
  );

  // Update player when active video changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (player) {
      if (activeVideo?.isEmpty) {
        player.pause();
      } else {
        player.currentTime = 0;
        player.play();
      }

    }
  }, [activeIndex]);

  // Sync remote videos
  useEffect(() => {
    if (
      groupData &&
      groupData.video_chats &&
      groupData.video_chats.length > 0
    ) {
      dispatch(syncRemoteVideos(groupData.video_chats));
    }
  }, [groupData]);

  // Camera state
  const [isCameraExpanded, setIsCameraExpanded] = useState(false);

  const handleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCameraExpanded(true);
    player?.pause();
  }, [player]);

  const handleClose = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCameraExpanded(false);
    if (!activeVideo?.isEmpty) {
      player?.play();
    }
  }, [player, activeVideo]);

  const handleVideoCaptured = useCallback((path: string) => {
    console.log("Video captured at:", path);
    handleClose();
  }, [handleClose]);

  // Handle active index change from carousel
  const handleActiveIndexChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Video tap animation
  const videoScale = useSharedValue(1);
  const handleVideoPress = useCallback(() => {
    videoScale.value = withSpring(0.97, { damping: 15 });
    setTimeout(() => {
      videoScale.value = withSpring(1, { damping: 15 });
    }, 100);
  }, []);

  const videoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: videoScale.value }],
  }));

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={styles.headerTitle}>Buzz</Text>
          <View style={styles.avatarContainer}>
            {userData?.profile_photo ? (
              <Image
                source={{ uri: userData.profile_photo }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[styles.avatar, { backgroundColor: "#333" }]}
              />
            )}
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Group Title */}
          <Text style={styles.groupTitle}>
            {groupData?.group_name || "Group 1"}
          </Text>

          {/* Main Video Player */}
          <Pressable onPress={handleVideoPress}>
            <Animated.View
              style={[styles.mainVideoContainer, videoAnimatedStyle]}
            >
              {activeVideo && !activeVideo.isEmpty ? (
                <>
                  <VideoView
                    player={player}
                    style={styles.mainVideo}
                    contentFit="cover"
                    nativeControls={false}
                  />
                  {/* Video Info Overlay */}
                  <View style={styles.videoInfoOverlay}>
                    <View style={styles.videoInfoPill}>
                      <Text style={styles.videoInfoText}>
                        📹 {activeVideo.createdBy}
                      </Text>
                    </View>
                    <View style={styles.videoCountPill}>
                      <Text style={styles.videoCountText}>
                        {activeIndex + 1} / {TEST_VIDEOS.length}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.emptyVideoPlaceholder}>
                  <Text style={styles.emptyVideoEmoji}>👤</Text>
                  <Text style={styles.emptyVideoText}>
                    {activeVideo?.createdBy || "No video"}
                  </Text>
                  <Text style={styles.emptyVideoSubtext}>
                    No video available
                  </Text>
                </View>
              )}
            </Animated.View>
          </Pressable>

          {/* Video Bubble Carousel */}
          <View style={styles.carouselSection}>
            <VideoBubbleCarousel
              videos={TEST_VIDEOS}
              activeIndex={activeIndex}
              onActiveIndexChange={handleActiveIndexChange}
            />
          </View>

          {isLoading && (
            <ActivityIndicator
              size={"large"}
              color={"#fff"}
              style={{ marginTop: 20 }}
            />
          )}
        </View>

        {/* Camera Preview */}
        <View
          style={[
            styles.cameraWrapper,
            isCameraExpanded
              ? styles.cameraFullScreen
              : styles.cameraSmall,
          ]}
        >
          <SeamlessCamera
            isExpanded={isCameraExpanded}
            onExpand={handleExpand}
            onClose={handleClose}
            navigation={navigation}
            onVideoCaptured={handleVideoCaptured}
          />
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default TestAppHomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#0a0a0a",
    flex: 1,
  },
  header: {
    height: 85,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 15,
    paddingTop: 30,
    zIndex: 1,
  },
  headerTitle: {
    color: "#e37239",
    fontSize: 26,
    fontStyle: "italic",
    fontWeight: "bold",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: "#e37239",
    backgroundColor: "#333",
  },
  content: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  groupTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    marginLeft: 4,
  },
  // Main Video Player
  mainVideoContainer: {
    width: "100%",
    height: VIDEO_PLAYER_HEIGHT,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#111",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 12,
  },
  mainVideo: {
    width: "100%",
    height: "100%",
  },
  videoInfoOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  videoInfoPill: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  videoInfoText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  videoCountPill: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  videoCountText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "600",
  },
  emptyVideoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#151515",
  },
  emptyVideoEmoji: {
    fontSize: 50,
    opacity: 0.3,
    marginBottom: 12,
  },
  emptyVideoText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyVideoSubtext: {
    color: "#333",
    fontSize: 13,
    marginTop: 4,
  },
  // Carousel Section
  carouselSection: {
    marginTop: 40,
    flex: 1,
    overflow: "visible",
  },


  // Camera Styles
  cameraWrapper: {
    position: "absolute",
    overflow: "hidden",
    backgroundColor: "black",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  cameraSmall: {
    width: SMALL_WIDTH,
    height: SMALL_HEIGHT,
    bottom: SMALL_BOTTOM,
    left: SMALL_LEFT,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#e37239",
    zIndex: 10,
  },
  cameraFullScreen: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    bottom: 0,
    borderRadius: 0,
    borderWidth: 0,
    zIndex: 1000,
  },
});
