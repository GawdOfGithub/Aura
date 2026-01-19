import useBackgroundRemoval from "@/hooks/BackgroundRemovalResult";
import { normalizeFileUri } from "@/utilities/filePathNormalization";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  runAtTargetFps,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  Camera as VisionCamera,
} from "react-native-vision-camera";
import {
  useFaceDetector,
  type Face,
} from "react-native-vision-camera-face-detector";
import { Worklets } from "react-native-worklets-core";
import {
  CIRCLE_CENTER_X,
  CIRCLE_CENTER_Y,
  CIRCLE_RADIUS,
  CircleOverlay,
} from "../components/SelfieCameraComponents/CircleOverlay";
import { useFaceValidation } from "../hooks/useFaceValidation";
import { StickerImage } from "./components/StickerImage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CAMERA_SIZE = CIRCLE_RADIUS * 2;
const TARGET_FPS = 15;

const faceDetectionOptions = {
  performanceMode: "fast" as const,
  contourMode: "all" as const,
  landmarkMode: "none" as const,
  classificationMode: "none" as const,
};

export const SelfieCameraScreen: React.FC = () => {
  const cameraRef = useRef<VisionCamera>(null);
  const device = useCameraDevice("front");
  const { hasPermission, requestPermission } = useCameraPermission();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const {
    processedUri: processedImage,
    isProcessing,
    error: bgRemovalError,
  } = useBackgroundRemoval(capturedPhoto);
  const error = bgRemovalError || captureError;

  const circleDiameter = CIRCLE_RADIUS * 2;
  const { validationState, validateFace } = useFaceValidation({
    circleBounds: {
      centerX: CIRCLE_RADIUS,
      centerY: CIRCLE_RADIUS,
      radius: CIRCLE_RADIUS,
    },
    screenWidth: circleDiameter,
    screenHeight: circleDiameter,
  });

  const { detectFaces, stopListeners } = useFaceDetector(faceDetectionOptions);

  useEffect(() => {
    return () => stopListeners();
  }, [stopListeners]);

  const handleFacesOnJS = useCallback(
    (faces: Face[], frameWidth: number, frameHeight: number) => {
      validateFace(faces, frameWidth, frameHeight);
    },
    [validateFace],
  );

  const runFaceValidationOnJS = Worklets.createRunOnJS(handleFacesOnJS);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      runAtTargetFps(TARGET_FPS, () => {
        "worklet";
        const faces = detectFaces(frame);
        runFaceValidationOnJS(faces, frame.width, frame.height);
      });
    },
    [detectFaces, runFaceValidationOnJS],
  );

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !validationState.isValid) return;
    try {
      setCaptureError(null);
      const photo = await cameraRef.current.takePhoto({ flash: "off" });
      setCapturedPhoto(normalizeFileUri(photo.path));
    } catch (err) {
      console.error("Failed to capture photo:", err);
      setCaptureError("Failed to capture photo");
    }
  }, [validationState.isValid]);

  const resetCamera = useCallback(() => {
    setCapturedPhoto(null);
    setCaptureError(null);
  }, []);

  React.useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No front camera available</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Take a Selfie</Text>
            <Text style={styles.headerSubtitle}>
              Position your face within the circle
            </Text>
          </View>

          {!capturedPhoto ? (
            <>
              <View style={styles.cameraCircle}>
                <VisionCamera
                  ref={cameraRef}
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive={true}
                  photo={true}
                  frameProcessor={frameProcessor}
                  pixelFormat="yuv"
                />
              </View>
              <CircleOverlay
                isValid={validationState.isValid}
                message={validationState.message}
              />
            </>
          ) : (
            <View style={styles.previewContainer}>
              <View style={styles.circularPreviewWrapper}>
                {processedImage ? (
                  <StickerImage source={{ uri: processedImage }} />
                ) : (
                  <Image
                    source={{ uri: capturedPhoto }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                )}
              </View>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.controls}>
            {isProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#4ADE80" />
                <Text style={styles.processingText}>
                  Removing background...
                </Text>
              </View>
            ) : !capturedPhoto ? (
              <TouchableOpacity
                style={[
                  styles.captureButton,
                  !validationState.isValid && styles.captureButtonDisabled,
                ]}
                onPress={handleCapture}
                disabled={!validationState.isValid}
              >
                <View
                  style={[
                    styles.captureButtonInner,
                    validationState.isValid && styles.captureButtonInnerActive,
                  ]}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={resetCamera}
              >
                <Text style={styles.buttonText}>Retake</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  cameraCircle: {
    position: "absolute",
    left: CIRCLE_CENTER_X - CIRCLE_RADIUS,
    top: CIRCLE_CENTER_Y - CIRCLE_RADIUS,
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS,
    overflow: "hidden",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    padding: 20,
  },
  permissionText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    zIndex: 10,
  },
  headerTitle: { color: "#4ADE80", fontSize: 28, fontWeight: "bold" },
  headerSubtitle: { color: "#aaa", fontSize: 14, marginTop: 4 },
  previewContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  circularPreviewWrapper: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: CAMERA_SIZE / 2,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#4ADE80",
  },
  previewImage: { width: "100%", height: "100%" },
  errorContainer: { paddingHorizontal: 20, paddingVertical: 8 },
  errorText: { color: "#ff6b6b", textAlign: "center", fontSize: 14 },
  controls: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  captureButtonDisabled: { opacity: 0.5 },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  captureButtonInnerActive: { backgroundColor: "#4ADE80" },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
  },
  resetButton: { backgroundColor: "#4a4e69" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  processingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 5,
  },
  processingText: { color: "#aaa", fontSize: 14, marginTop: 8 },
});

export default SelfieCameraScreen;
