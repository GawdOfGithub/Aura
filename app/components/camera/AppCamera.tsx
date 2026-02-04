import uploadQueueManager from "@/app/modules/upload/uploadQueueManager";
import { enqueueVideo } from "@/app/store/features/upload/uploadSlice";
import { AppVideoCaptured } from "@/app/types";
import { nanoid } from "@reduxjs/toolkit";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import {
  Camera,
  CameraPosition,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useMicrophonePermission,
} from "react-native-vision-camera";
import { fetchPresignedUrl } from "../../store/features/upload/uploadThunk";
import { useAppDispatch } from "../../store/hooks";

// --- TYPES ---

export type AppCameraRef = {
  startRecording: () => void;
  stopRecording: () => Promise<void>;
  toggleCamera: () => void;
  // Allows parent to feed gesture data into the camera's logic
  handleGesture: (type: "begin" | "update" | "end", payload?: any) => void;
};

type AppCameraProps = {
  forCapture: boolean;
  cameraIsActive: boolean;
  viewStyle?: ViewStyle;
  chatId: string;
  onVideoCaptured: ({ videoPath, id }: AppVideoCaptured) => void;
};

// --- COMPONENT ---

export const AppCamera = forwardRef<AppCameraRef, AppCameraProps>(
  ({ forCapture, cameraIsActive, viewStyle, onVideoCaptured, chatId }, ref) => {
    const dispatch = useAppDispatch();
    const camera = useRef<Camera>(null);

    // --- STATE ---
    const [camPosition, setCamPosition] = useState<CameraPosition>("front");
    const [zoom, setZoom] = useState(1);
    const [isRecording, setIsRecording] = useState(false);
    const isRecordingRef = useRef(false);

    // --- SETUP ---
    const device = useCameraDevice(camPosition);
    const format = useCameraFormat(device, [
      { videoResolution: { width: 1280, height: 720 } },
      { fps: 30 },
    ]);
    const { hasPermission: hasCam } = useCameraPermission();
    const { hasPermission: hasMic } = useMicrophonePermission();

    // --- REFS FOR LOGIC ---
    const currentRecordingId = useRef<string | null>(null);
    const recordingTime = useRef<NodeJS.Timeout | null>(null);
    const recordingTimeout = useRef<number | null>(null); // For tap vs hold
    const lastFlipX = useRef(0);
    const startZoom = useRef(1);
    const lastTap = useRef(0);

    // Reset zoom when device changes
    useEffect(() => {
      setZoom(device?.minZoom ?? 1);
    }, [device?.id]);

    // --- ACTIONS ---

    const toggleCamera = useCallback(() => {
      setCamPosition((p) => (p === "back" ? "front" : "back"));
    }, []);

    const startRecording = useCallback(() => {
      if (!camera.current || !forCapture) return;

      setIsRecording(true);
      isRecordingRef.current = true;
      const id = nanoid();
      currentRecordingId.current = id;

      // Upload Prep
      dispatch(
        fetchPresignedUrl({
          id,
          file_name: `${id}.mp4`,
          file_type: "video/mp4",
          chat_id: chatId,
        }),
      );

      camera.current.startRecording({
        fileType: "mp4",
        videoCodec: "h265",
        onRecordingFinished: (video) => {
          setIsRecording(false);
          isRecordingRef.current = false;
          onVideoCaptured({
            videoPath: video.path,
            id: currentRecordingId.current ?? nanoid(),
          });

          // Uploader
          // To be put right now after the send button
          dispatch(
            enqueueVideo({
              id: currentRecordingId.current ?? nanoid(),
              uri: video.path,
              chatId: chatId,
            }),
          );
          uploadQueueManager.start();
        },
        onRecordingError: (e) => {
          console.error(e);
          setIsRecording(false);
          isRecordingRef.current = false;
        },
      });
    }, [forCapture, dispatch]);

    const stopRecording = useCallback(async () => {
      if (camera.current && isRecording) {
        await camera.current.stopRecording();
      }
    }, [isRecording]);

    // --- GESTURE PROCESSING LOGIC ---
    // We expose this function so the Parent can feed x/y values into it
    const handleGesture = useCallback(
      (
        type: "begin" | "update" | "end",
        payload?: { x: number; y: number },
      ) => {
        if (!forCapture) return;

        if (type === "begin") {
          lastFlipX.current = 0;
          startZoom.current = zoom;
          // Hold to record logic
          recordingTimeout.current = setTimeout(() => {
            startRecording();
            recordingTimeout.current = null;
          }, 300);
        } else if (type === "update" && payload) {
          if (!isRecordingRef.current) return;
          const { x, y } = payload;

          // Flip Logic
          if (Math.abs(x - lastFlipX.current) > 120) {
            toggleCamera();
            lastFlipX.current = x;
          }

          // Zoom Logic
          const zoomChange = -y / 150;
          const min = device?.minZoom ?? 1;
          const max = Math.min(device?.maxZoom ?? 5, 5);
          setZoom(Math.max(min, Math.min(max, startZoom.current + zoomChange)));
        } else if (type === "end") {
          if (recordingTimeout.current) {
            // It was a short tap (Toggle check)
            clearTimeout(recordingTimeout.current);
            recordingTimeout.current = null;
            // It was a recording hold
            stopRecording();
          }
        }
      },
      [zoom, device, forCapture, startRecording, stopRecording, toggleCamera],
    );

    // --- EXPOSE METHODS TO PARENT ---
    useImperativeHandle(ref, () => ({
      startRecording,
      stopRecording,
      toggleCamera,
      handleGesture,
    }));

    if (!device || !hasCam || (forCapture && !hasMic))
      return <View style={styles.blackBg} />;

    return (
      <View style={[styles.fullScreenContainer, viewStyle]}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={cameraIsActive}
          video={forCapture}
          audio={forCapture}
          format={format}
          zoom={zoom}
          resizeMode="cover"
          outputOrientation="preview"
          enableZoomGesture={false} // Important: We control zoom via parent gesture
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  blackBg: { flex: 1, backgroundColor: "black" },
  fullScreenContainer: { flex: 1, overflow: "hidden" },
});
