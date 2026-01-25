import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
} from "react-native-vision-camera";

// components/FixedSkiaCanvas.tsx
import { ProgressiveBlurView } from "@sbaiahmed1/react-native-blur";
import { useSharedValue } from "react-native-reanimated";

// --- CONFIGURATION ---
// 240p is perfect for a blurred background.
// Anything higher is wasted battery processing pixels you won't see clearly.
const TARGET_WIDTH = 240;

const TARGET_HEIGHT = 320;
const BLUR_RADIUS = 15;
const OVERLAY_OPACITY = 0.75; // 0 to 1

export const BlurBGCamera = () => {
  const { width, height } = Dimensions.get("window");
  const device = useCameraDevice("front");
  const currentFrame = useSharedValue(null);

  // 1. FORMAT: Strict Low-Res Logic
  // We sort formats to find the one closest to 240p to minimize memory bandwidth.
  const format = useCameraFormat(device, [
    { videoResolution: { width: TARGET_WIDTH, height: TARGET_HEIGHT } },
    { fps: 30 }, // 30 FPS is plenty for a smooth background
  ]);

  if (!device) return <View style={styles.blackBg} />;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        format={format}
        // --- OPTIMIZATIONS ---
        video={false} // DISABLES video encoder (Huge battery saver)
        audio={false} // DISABLES audio session (Huge battery saver)
        pixelFormat="yuv" // Zero-copy GPU texture
        enableZoomGesture={false} // Disable native gestures
        // --- SKIA RENDERER ---
      />
      <ProgressiveBlurView
        overlayColor={"rgba(0,0,0,0.75)"}
        blurAmount={70}
        blurType="extraDark"
        style={[
          {
            height: height + 200,
            width: width,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1, // Push to back
    backgroundColor: "black", // Fallback while loading
  },
  blackBg: {
    flex: 1,
    backgroundColor: "black",
  },
  fill: { flex: 1 },
});
