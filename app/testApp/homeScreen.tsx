import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppSelector } from "../store/hooks";
import { SeamlessCamera } from "./cameraSceen"; // Import the file above
import { VideoBubble } from "./components/videoComponent";
import { useVideosStorage } from "./contexts";
import { useGroupData } from "./hooks";

// ----- THIS CHANGED: Enable LayoutAnimation for Android -----
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");
const SMALL_WIDTH = 120;
const SMALL_HEIGHT = 180;
const SMALL_BOTTOM = 50;
// Calculate center position for the small box
const SMALL_LEFT = (WINDOW_WIDTH - SMALL_WIDTH) / 2;

const TestAppHomeScreen = () => {
  const { data: userData } = useAppSelector((state) => state.user);
  const { groupData } = useGroupData();
  const { getVideosLast24Hours, isLoading, deleteAllVideos, syncRemoteVideos } =
    useVideosStorage();

  // 3. The Magic: Sync when groupData arrives
  useEffect(() => {
    if (
      groupData &&
      groupData.video_chats &&
      groupData.video_chats.length > 0
    ) {
      // Pass the video_chats array to the context
      syncRemoteVideos(groupData.video_chats);
    }
  }, [groupData, syncRemoteVideos]);

  // useEffect(() => {
  //   deleteAllVideos();
  // }, []);
  const recentVideos = getVideosLast24Hours();
  // ----- THIS CHANGED: Track expansion state instead of Open/Closed -----
  const [isCameraExpanded, setIsCameraExpanded] = useState(false);

  const handleExpand = () => {
    // Animate the layout change
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCameraExpanded(true);
  };

  const handleClose = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCameraExpanded(false);
  };

  const handleVideoCaptured = (path: string) => {
    console.log("Video captured at:", path);
    // You can navigate or do something else here
    handleClose();
  };

  return (
    <SafeAreaProvider style={{ backgroundColor: "#212121", flex: 1 }}>
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
              <View style={[styles.avatar, { backgroundColor: "#ccc" }]} />
            )}
          </View>
        </View>

        {/* Main Feed Content Placeholder */}
        <View style={styles.content}>
          <Text style={styles.groupTitle}>{groupData?.group_name}</Text>
          <ScrollView
            contentContainerStyle={{
              width: "100%",
              flexDirection: "row",
              flexWrap: "wrap",
            }}>
            {recentVideos.map((video) => (
              <VideoBubble
                key={video.id}
                videoUri={video.videoFilePath}
                videoCreatedBy={video.videoCapturedBy}
              />
            ))}
            {isLoading && <ActivityIndicator size={"large"} color={"#fff"} />}
            {recentVideos.length === 0 && !isLoading && (
              <Text
                style={{
                  color: "#EAE0CF",
                  marginTop: 20,
                  fontStyle: "italic",
                }}>
                No videos in the last 24h, Let`s Start Buzzing!
              </Text>
            )}
          </ScrollView>
        </View>

        <View
          style={[
            styles.cameraWrapper,
            isCameraExpanded ? styles.cameraFullScreen : styles.cameraSmall,
          ]}>
          <SeamlessCamera
            isExpanded={isCameraExpanded}
            onExpand={handleExpand}
            onClose={handleClose}
            onVideoCaptured={handleVideoCaptured}
          />
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default TestAppHomeScreen;

const styles = StyleSheet.create({
  header: {
    height: 100,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "grey",
    paddingHorizontal: 15,
    paddingTop: 30,
    zIndex: 1, // Keep header behind camera when expanded
  },
  headerTitle: {
    color: "#e37239",
    fontSize: 24,
    fontStyle: "italic",
    fontWeight: "bold",
  },
  groupTitle: {
    color: "#eee9df",
    fontSize: 24,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f0f0f0",
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },

  // ----- THIS CHANGED: Styles for the Camera Animation -----
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
  // 1. Small Preview State
  cameraSmall: {
    width: SMALL_WIDTH,
    height: SMALL_HEIGHT,
    bottom: SMALL_BOTTOM,
    left: SMALL_LEFT,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
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
