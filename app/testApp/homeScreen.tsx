import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import VideoWaveform from "../components/audio/audioWaveform";
import { useFileFromAsset } from "../hooks/useFileFromAsset";
import {
  selectIsVideoLoading,
  selectVideosLast24Hours,
  syncRemoteVideos,
} from "../store/features/groups/groupPostsSlice";
import { useGetGroupInfoQuery } from "../store/features/groups/groupsApi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { SeamlessCamera } from "./cameraSceen";
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

const TestAppHomeScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { data: userData } = useAppSelector((state) => state.user);

  // Direct usage of RTK Query hook
  const { data: groupData } = useGetGroupInfoQuery();

  const isLoading = useAppSelector(selectIsVideoLoading);
  const recentVideos = useAppSelector(selectVideosLast24Hours);

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
  }, []);

  const handleClose = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCameraExpanded(false);
  }, []);

  const handleVideoCaptured = useCallback(
    (path: string) => {
      console.log("Video captured at:", path);
      handleClose();
    },
    [handleClose]
  );

  const videoSource =
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4";

  const localUri2 = useFileFromAsset(
    require("../../assets/jayshankar.mp4"),
    "sample3.mp4"
  );

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <GestureHandlerRootView style={{ flex: 1 }}>
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
              <View style={[styles.avatar, { backgroundColor: "#333" }]} />
            )}
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.groupTitle}>
            {groupData?.group_name || "Group 1"}
          </Text>
          {localUri2 && (
            <VideoWaveform
              source={localUri2}
              style={{
                width: 142,
                backgroundColor: "#FFFFFF2B",
                paddingHorizontal: 10,
                borderRadius: 48,
              }}
            />
          )}
        </View>

        <View
          style={[
            styles.cameraWrapper,
            isCameraExpanded ? styles.cameraFullScreen : styles.cameraSmall,
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
