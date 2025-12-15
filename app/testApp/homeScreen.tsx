import React, { useContext, useState } from "react";
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
import { AuthContext } from "../index";
import { SeamlessCamera } from "./cameraSceen"; // Import the file above

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
  const { userData } = useContext(AuthContext);

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
    <SafeAreaProvider style={{ backgroundColor: "black", flex: 1 }}>
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
        <View style={styles.content}>{/* Your feed list would go here */}</View>

        {/* ----- THIS CHANGED: Single Camera Component ----- 
          It is always mounted. We change the style of the wrapper View 
          based on isCameraExpanded state.
        */}
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
    color: "orange",
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
    justifyContent: "center",
    alignItems: "center",
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
