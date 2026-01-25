import { NavigationProp } from "@react-navigation/native";
import { nanoid } from "@reduxjs/toolkit";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import {
  Camera,
  CameraPosition,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useMicrophonePermission,
} from "react-native-vision-camera";
import uploadQueueManager from "../../modules/upload/uploadQueueManager";
import { enqueueVideo } from "../../store/features/upload/uploadSlice";
import { fetchPresignedUrl } from "../../store/features/upload/uploadThunk";
import { useAppDispatch } from "../../store/hooks";

// ----- CONSTANTS -----
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const TARGET_BITRATE = 1.5 * 1000 * 1000; // 1.5 Mbps
const TARGET_RESOLUTION = { width: 1280, height: 720 };
const TARGET_FPS = 30;

type AppCameraProps = {
  forCapture: boolean; // Determines mode (UI-only vs Recording)
  onClose?: () => void;
  viewStyle?: ViewStyle;
  navigation?: NavigationProp<any>;
};

export const AppCamera = ({
  forCapture,
  viewStyle,
  onClose,
  navigation,
}: AppCameraProps) => {
  const dispatch = useAppDispatch();
  const [camPosition, setCamPosition] = useState<CameraPosition>("front");

  // 1. Device Selection
  const device = useCameraDevice(camPosition);

  // 2. Format Selection (HD 720p @ 30fps)
  // We prioritize the resolution and FPS requested.
  const cameraFormat = useCameraFormat(device, [
    { videoResolution: TARGET_RESOLUTION },
    { fps: TARGET_FPS },
  ]);

  const {
    hasPermission: hasCamPermission,
    requestPermission: requestCamPermission,
  } = useCameraPermission();
  const {
    hasPermission: hasMicPermission,
    requestPermission: requestMicPermission,
  } = useMicrophonePermission();

  const camera = useRef<Camera>(null);
  const [isRecording, setIsRecording] = useState(false);

  // --- ZOOM STATE ---
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 5, 5);
  const [zoom, setZoom] = useState(minZoom);

  // --- RECORDING STATE ---
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTime = useRef<NodeJS.Timeout | null | number>(null);
  const currentRecordingId = useRef<string | null>(null);

  // --- GESTURE REFS ---
  const recordingTimeout = useRef<NodeJS.Timeout | null | number>(null);
  const lastTap = useRef<number>(0);
  const lastFlipX = useRef(0);
  const startZoom = useRef(minZoom);

  // Initial Permission Check
  useEffect(() => {
    if (!hasCamPermission) requestCamPermission();
    if (forCapture && !hasMicPermission) requestMicPermission();
  }, [hasCamPermission, hasMicPermission, forCapture]);

  // Reset Zoom on Device Change
  useEffect(() => {
    setZoom(minZoom);
  }, [device?.id]);

  const startRecording = () => {
    if (!camera.current || !forCapture) return;

    setIsRecording(true);
    const uniqueSessionId = nanoid();
    currentRecordingId.current = uniqueSessionId;

    // Pre-fetch upload URL (Optimistic)
    dispatch(
      fetchPresignedUrl({
        id: uniqueSessionId,
        file_name: `${uniqueSessionId}.mp4`,
        file_type: "video/mp4",
      }),
    );

    // Timer Logic
    const startTime = Date.now();
    setRecordingDuration(0);
    recordingTime.current = setInterval(() => {
      setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 500);

    camera.current.startRecording({
      fileType: "mp4",
      videoCodec: "h265", // Efficient compression
      onRecordingFinished: async (video) => {
        if (recordingTime.current) clearInterval(recordingTime.current);
        setRecordingDuration(0);
        setIsRecording(false);

        // Enqueue for upload
        dispatch(
          enqueueVideo({
            id: currentRecordingId.current
              ? currentRecordingId.current
              : nanoid(),
            uri: video.path,
          }),
        );
        uploadQueueManager.start();
      },
      onRecordingError: (err) => {
        if (recordingTime.current) clearInterval(recordingTime.current);
        setRecordingDuration(0);
        console.error("Recording Error:", err);
        setIsRecording(false);
      },
    });
  };

  const stopRecording = async () => {
    if (camera.current && isRecording) {
      await camera.current.stopRecording();
    }
  };

  const toggleCamera = () => {
    setCamPosition((prev) => (prev === "back" ? "front" : "back"));
  };

  // --- GESTURES LOGIC ---

  const handleGestureBegin = () => {
    lastFlipX.current = 0;
    startZoom.current = zoom;
    // Delay recording slightly to distinguish between a tap and a hold
    recordingTimeout.current = setTimeout(() => {
      startRecording();
      recordingTimeout.current = null;
    }, 300);
  };

  const handleGestureUpdate = (translationX: number, translationY: number) => {
    // 1. Flip Camera Logic (Horizontal Swipe)
    const FLIP_THRESHOLD = 120;
    const distanceMoved = Math.abs(translationX - lastFlipX.current);
    if (distanceMoved >= FLIP_THRESHOLD) {
      toggleCamera();
      lastFlipX.current = translationX;
    }

    // 2. Zoom Logic (Vertical Swipe)
    // Only zoom if recording or preparing to record
    const swipeY = -translationY;
    const zoomChange = swipeY / 150;
    let newZoom = startZoom.current + zoomChange;
    if (newZoom < minZoom) newZoom = minZoom;
    if (newZoom > maxZoom) newZoom = maxZoom;
    setZoom(newZoom);
  };

  const handleGestureEnd = () => {
    if (recordingTimeout.current) {
      // Logic for Tap (Toggle Camera if short tap)
      clearTimeout(recordingTimeout.current);
      recordingTimeout.current = null;
      handleDoubleTapCheck();
    } else {
      stopRecording();
    }
  };

  const handleDoubleTapCheck = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      toggleCamera();
    } else {
      // Single tap logic if needed
    }
    lastTap.current = now;
  };

  // Gesture Definition: Only enable gestures if forCapture is TRUE
  const panGesture = Gesture.Pan()
    .enabled(forCapture)
    .onBegin(() => runOnJS(handleGestureBegin)())
    .onUpdate((e) =>
      runOnJS(handleGestureUpdate)(e.translationX, e.translationY),
    )
    .onFinalize(() => runOnJS(handleGestureEnd)());

  // --- RENDER HELPERS ---

  if (!device || !hasCamPermission) return <View style={styles.blackBg} />;

  // Dynamic Styles based on prop
  const containerStyle = forCapture
    ? styles.captureContainer // 16:9 Aspect Ratio
    : styles.fullScreenContainer; // Full Screen / 1:1

  return (
    <GestureDetector gesture={panGesture}>
      <View style={[containerStyle, viewStyle]}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true} // Keep active, but toggle pipelines below
          video={forCapture}
          audio={forCapture}
          format={cameraFormat}
          zoom={zoom}
          videoBitRate={2.5}
          resizeMode="cover" // Ensures screen is filled
          enableZoomGesture={forCapture} // Native zoom gesture
        />
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  blackBg: {
    flex: 1,
    backgroundColor: "black",
  },
  // 16:9 Viewport for Capture
  captureContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * (16 / 9), // 16:9 Aspect Ratio (Vertical)
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "black",
  },
  // Full Screen / Optimized Background
  fullScreenContainer: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
});
