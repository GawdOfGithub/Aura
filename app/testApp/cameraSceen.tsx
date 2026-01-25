import { NavigationProp } from "@react-navigation/native";
import { nanoid } from "@reduxjs/toolkit";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
import uploadQueueManager from "../modules/upload/uploadQueueManager";
import { enqueueVideo } from "../store/features/upload/uploadSlice";
import { fetchPresignedUrl } from "../store/features/upload/uploadThunk";
import { useAppDispatch, useAppSelector } from "../store/hooks";

// ----- THIS CHANGED: New Props Interface to communicate with Home Screen -----
type SeamlessCameraProps = {
  isExpanded: boolean;
  onExpand: () => void;
  onClose: () => void;
  onVideoCaptured: (path: string) => void;
  navigation: NavigationProp<any>;
};

export const SeamlessCamera = ({
  isExpanded,
  onExpand,
  onClose,
  onVideoCaptured,
  navigation,
}: SeamlessCameraProps) => {
  const dispatch = useAppDispatch(); // 1. Get Dispatch
  const [camPosition, setCamPosition] = useState<CameraPosition>("front");
  const device = useCameraDevice(camPosition);

  const { token: userToken, data: userData } = useAppSelector(
    (state) => state.user,
  );
  // ----- THIS CHANGED: High quality format for both preview and recording -----
  const cameraFormat = useCameraFormat(device, [
    { videoResolution: { width: 1280, height: 1280 } },
    { fps: 30 },
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

  // --- ZOOM STATE (Kept as requested) ---
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 5, 5);
  const [zoom, setZoom] = useState(minZoom);

  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTime = useRef<NodeJS.Timeout | null | number>(null);
  const currentRecordingId = useRef<string | null>(null);
  const recordingTimeout = useRef<NodeJS.Timeout | null | number>(null);
  const lastTap = useRef<number>(0);
  const lastFlipX = useRef(0);
  const startZoom = useRef(minZoom);

  useEffect(() => {
    if (!hasCamPermission) requestCamPermission();
    if (!hasMicPermission) requestMicPermission();
  }, [hasCamPermission, hasMicPermission]);

  useEffect(() => {
    setZoom(minZoom);
  }, [device?.id]);

  const startRecording = () => {
    if (!camera.current) return;
    setIsRecording(true);

    const uniqueSessionId = nanoid();
    currentRecordingId.current = uniqueSessionId;
    dispatch(
      fetchPresignedUrl({
        id: uniqueSessionId,
        file_name: `${uniqueSessionId}.mp4`,
        file_type: "video/mp4",
      }),
    );

    const startTime = Date.now();
    setRecordingDuration(0);
    recordingTime.current = setInterval(() => {
      setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 500);

    camera.current.startRecording({
      fileType: "mp4",
      videoCodec: "h265",
      onRecordingFinished: async (video) => {
        if (recordingTime.current) clearInterval(recordingTime.current);
        setRecordingDuration(0);
        setIsRecording(false);
        //navigation.navigate("VideoPreview", { path: video.path });

        //Add video to uploader module
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
        console.error(err);
        setIsRecording(false);
      },
    });
  };

  const stopRecording = async () => {
    if (camera.current) await camera.current.stopRecording();
  };

  const toggleCamera = () => {
    setCamPosition((prev) => (prev === "back" ? "front" : "back"));
  };

  // --- GESTURES (Logic Split based on isExpanded) ---

  const handleGestureBegin = () => {
    lastFlipX.current = 0;
    startZoom.current = zoom;
    recordingTimeout.current = setTimeout(() => {
      startRecording();
      recordingTimeout.current = null;
    }, 300);
  };

  const handleGestureUpdate = (translationX: number, translationY: number) => {
    // 1. Flip Camera Logic
    const FLIP_THRESHOLD = 120;
    const distanceMoved = Math.abs(translationX - lastFlipX.current);
    if (distanceMoved >= FLIP_THRESHOLD) {
      toggleCamera();
      lastFlipX.current = translationX;
    }

    // 2. Zoom Logic
    const swipeY = -translationY;
    const zoomChange = swipeY / 150;
    let newZoom = startZoom.current + zoomChange;
    if (newZoom < minZoom) newZoom = minZoom;
    if (newZoom > maxZoom) newZoom = maxZoom;
    setZoom(newZoom);
  };

  const handleGestureEnd = () => {
    if (recordingTimeout.current) {
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
    }
    lastTap.current = now;
  };

  // 1. Pan Gesture: Only active when expanded (Recording/Zooming)
  const panGesture = Gesture.Pan()
    .enabled(isExpanded)
    .onBegin(() => runOnJS(handleGestureBegin)())
    .onUpdate((e) =>
      runOnJS(handleGestureUpdate)(e.translationX, e.translationY),
    )
    .onFinalize(() => runOnJS(handleGestureEnd)());

  // 2. Tap Gesture: Only active when minimized (To expand)
  const tapGesture = Gesture.Tap()
    .enabled(!isExpanded)
    .onEnd(() => runOnJS(onExpand)());

  // Race: Whichever is enabled wins
  const composedGesture = Gesture.Race(panGesture, tapGesture);

  if (!device || !hasCamPermission) return <View style={styles.blackBg} />;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.container}>
        <View
          style={[
            styles.cameraContainer,
            isExpanded
              ? { width: 500, height: 500 }
              : { height: "100%", width: "100%" },
          ]}
        >
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            video={true}
            audio={true}
            format={cameraFormat}
            zoom={zoom}
          />
        </View>
        {/* ----- THIS CHANGED: Only show overlay when expanded ----- */}
        {isExpanded && (
          <View style={styles.overlay}>
            {isRecording ? (
              <View style={styles.recordingStatusContainer}>
                <View style={styles.recordingDot} />
                <Text style={styles.timerText}>
                  {formatDuration(recordingDuration)} {zoom.toFixed(1)}x
                </Text>
              </View>
            ) : (
              <Text style={styles.instructionText}>Hold to Record</Text>
            )}

            {!isRecording && (
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  cameraContainer: {
    borderRadius: 60,
    overflow: "hidden",
  },
  blackBg: { flex: 1, backgroundColor: "black" },
  overlay: {
    position: "absolute",
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
    justifyContent: "flex-end", // Push content to bottom
    alignItems: "center",
    paddingBottom: 50,
    pointerEvents: "box-none", // Allow touches to pass through empty areas
  },
  instructionText: {
    color: "orange",
    marginBottom: 10,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowRadius: 5,
  },
  recordingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: "#ff3b30",
  },
  closeButton: {
    marginTop: 20, // Space below text
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 25,
  },
  closeButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 4,
  },
  recordingStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  timerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10, // Space between dot and text
    fontVariant: ["tabular-nums"], // Prevents jitter as numbers change
  },
});
