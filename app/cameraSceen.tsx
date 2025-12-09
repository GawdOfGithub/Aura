import React, { useEffect, useRef, useState } from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Camera,
  CameraPosition,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useMicrophonePermission,
} from "react-native-vision-camera";
export const CameraRecorderScreen = ({
  onVideoCaptured,
}: {
  onVideoCaptured: (path: string) => void;
}) => {
  const [camPosition, setCamPosition] = useState<CameraPosition>("back");
  const device = useCameraDevice(camPosition);
  const cameraFormat = useCameraFormat(device, [
    { videoResolution: { width: 1280, height: 720 } },
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

  const recordingTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastTap = useRef<number>(0);

  useEffect(() => {
    if (!hasCamPermission) requestCamPermission();
    if (!hasMicPermission) requestMicPermission();
  }, [hasCamPermission, hasMicPermission]);

  // Permissions Logic (Simplified for brevity, usually you request these on mount)
  if (!hasCamPermission || !hasMicPermission)
    return (
      <View style={styles.center}>
        <TouchableOpacity onPress={() => Linking.openSettings()}>
          <Text style={{ color: "red" }}>No Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  if (!device)
    return (
      <View style={styles.center}>
        <Text>No Device</Text>
      </View>
    );
  const VIDEO_BIT_RATE = 3 * 1000000;
  const startRecording = () => {
    if (!camera.current) return;
    setIsRecording(true);
    camera.current.startRecording({
      fileType: "mp4",
      videoCodec: "h265",
      onRecordingFinished: (video) => {
        setIsRecording(false);
        onVideoCaptured(video.path);
      },
      onRecordingError: (err) => {
        console.error(err);
        setIsRecording(false);
      },
    });
  };

  const stopRecording = async () => {
    if (camera.current) await camera.current.stopRecording();
  };

  const handlePressIn = () => {
    // Wait 200ms before starting recording.
    // If user lifts finger before 200ms, it's a Tap, not a Hold.
    recordingTimeout.current = setTimeout(() => {
      startRecording();
      recordingTimeout.current = null; // Clear ref so PressOut knows we recorded
    }, 300);
  };

  const handlePressOut = () => {
    if (recordingTimeout.current) {
      // The timeout is still running, meaning we held for LESS than 200ms.
      // This is a TAP (not a hold).
      clearTimeout(recordingTimeout.current); // Cancel the recording start
      recordingTimeout.current = null;
      handleDoubleTapCheck(); // Check if this was a double tap
    } else {
      // The timeout was null, meaning recording DID start.
      // This is a HOLD release.
      stopRecording();
    }
  };

  const handleDoubleTapCheck = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // ms between taps to count as double

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // It's a double tap! Flip the camera.
      toggleCamera();
    }

    lastTap.current = now;
  };

  const toggleCamera = () => {
    // Don't flip if currently recording
    if (isRecording) return;

    setCamPosition((prev) => (prev === "back" ? "front" : "back"));
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.cameraContainer}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          video={true}
          audio={true}
          format={cameraFormat}
          videoBitRate={"extra-low"}
        />
        <View style={styles.overlay}>
          {isRecording ? (
            <Text style={[styles.instructionText, { color: "red" }]}>
              Recording...
            </Text>
          ) : (
            <Text style={styles.instructionText}>Hold Screen to Record</Text>
          )}
          {isRecording && <View style={styles.recordingDot} />}
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  cameraContainer: {
    width: "98%",
    height: "90%",
    borderRadius: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenVideo: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    alignItems: "center",
  },
  instructionText: {
    color: "white",
    marginBottom: 10,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowRadius: 5,
  },
  recordingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "red",
    borderWidth: 2,
    borderColor: "white",
  },
  // Preview UI
  previewUiContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoButton: {
    backgroundColor: "rgba(0,122,255,0.8)", // Blue for info
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
