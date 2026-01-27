import { useIsFocused } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { MinimalVideoItem } from "@/app/types";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Worklets } from "react-native-worklets-core";
import { CrossIcon, SendIcon } from "../../assets/images/svg";
import { scale } from "../../utility/responsive";
import AppVideoPlayer from "../videos/AppVideoPlayer";
import { AppCamera, AppCameraRef } from "./AppCamera";
import { DoubleIcon } from "./FlashRotateIcons";

const { width, height } = Dimensions.get("window");
export const CameraContainerHeight = scale.m(148);
export const CameraWrapperSize = scale.m(116);
const CameraWrapperBorderWidth = scale.m(8);
const CameraCircleSize = scale.m(90);

const CameraWrapperGap = scale.m(5);
const CameraRecordingWidth = scale.m(291);

const CameraRecordingHeight = scale.m(499);
const CameraRecordingPosition = height - scale.m(50) - CameraRecordingHeight;
const CameraOutOffScreenOffset = height + CameraRecordingHeight + 10;
export type CameraState =
  | "NoState"
  | "ActionState"
  | "RecordingState"
  | "PreviewSendState";

interface CameraControlsProps {
  cameraContainerStyle?: ViewStyle;
  cameraWrapperPositionFromBottom: number;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  cameraContainerStyle,
  cameraWrapperPositionFromBottom,
}) => {
  const cameraRef = useRef<AppCameraRef>(null);
  const isFocused = useIsFocused();
  const [cameraState, setCameraState] = useState<CameraState>("NoState");
  const capturedVideoRef = useRef<MinimalVideoItem | null>(null);
  //  Add a shared value for visibility (1 = visible, 0 = hidden)
  // hidden when state is changing
  const cameraVisible = useSharedValue(1);

  const cameraYPosition = useSharedValue(0);
  const getActionIconPositionFromBottom = (state: CameraState) => {
    return cameraWrapperPositionFromBottom + CameraWrapperSize + scale.v(22);
  };
  const getCameraPositionFromWrapper = (state: CameraState) => {
    if (state == "NoState") {
      return (
        CameraWrapperGap +
        CameraWrapperBorderWidth +
        (CameraContainerHeight - CameraWrapperSize) / 2
      );
    }
    return CameraWrapperGap + CameraWrapperBorderWidth;
  };

  useLayoutEffect(() => {
    if (cameraState === "RecordingState") {
      // Logic for Recording: Teleport top, then slide down
      cameraYPosition.value = withTiming(CameraRecordingPosition, {
        duration: 300,
      }); // Animate down
      cameraVisible.value = 1;
    }
    if (cameraState == "NoState") {
      cameraYPosition.value = 0 + getCameraPositionFromWrapper("NoState");
      cameraVisible.value = 1;
    }
    if (cameraState == "ActionState") {
      cameraYPosition.value =
        cameraWrapperPositionFromBottom +
        getCameraPositionFromWrapper("ActionState");
      cameraVisible.value = 1;
    }
  }, [cameraState]);

  const cancelCapturing = () => {
    console.log("cancelling");
    capturedVideoRef.current = null;
    setCameraState("NoState");
  };
  const handleVideoCaptured = (capturedVideo: MinimalVideoItem) => {
    capturedVideoRef.current = capturedVideo;
    setCameraState("PreviewSendState");
  };

  const handleSinglePress = () => {
    cameraVisible.value = 0;
    if (cameraState === "NoState") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCameraState("ActionState");
    } else if (cameraState === "ActionState") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setCameraState("NoState");
    }
  };

  const handleLongPress = () => {
    if (cameraState == "NoState" || cameraState == "ActionState") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      cameraYPosition.value = CameraOutOffScreenOffset;
      setCameraState("RecordingState");
      if (cameraRef.current) {
        cameraRef.current.startRecording();
      }
    }
  };

  const handleLongPressEnd = () => {
    if (cameraRef.current && cameraState == "RecordingState") {
      cameraRef.current.stopRecording();
    }
  };
  const containerStyle = useMemo((): ViewStyle => {
    if (cameraState === "ActionState") {
      return {
        position: "absolute" as const,
        zIndex: 10,
        width: width,
        height: height,
        backgroundColor: "rgba(0,0,0,0.75)",
        flexDirection: "row" as const,
        justifyContent: "center",
        alignItems: "flex-end",
      };
    }
    if (cameraState == "RecordingState" || cameraState == "PreviewSendState") {
      return {
        position: "absolute" as const,
        zIndex: 10,
        width: width,
        height: height,
        backgroundColor: "rgba(0,0,0,1)",
        alignItems: "center",
      };
    }
    if (cameraState == "NoState") {
      return {
        ...styles.container,
        position: "absolute",
        bottom:
          cameraWrapperPositionFromBottom -
          (CameraContainerHeight - CameraWrapperSize) / 2,
      };
    }
    return styles.container;
  }, [cameraState]);

  const cameraButtonStyle = useMemo((): ViewStyle => {
    if (cameraState === "ActionState") {
      return {
        position: "absolute" as const,
        bottom: cameraWrapperPositionFromBottom,
        alignSelf: "center" as const,
      };
    } else if (cameraState == "RecordingState") {
      return {
        position: "absolute" as const,
        bottom: cameraWrapperPositionFromBottom,
        alignSelf: "center" as const,
        width: scale.m(92),
        height: scale.m(92),
        borderWidth: 6,
        borderColor: "rgba(239, 45, 28, 1)",
      };
    }
    return {};
  }, [cameraState]);

  //Animation of Camera
  const cameraStateStyle = useMemo((): ViewStyle => {
    if (cameraState == "RecordingState") {
      return {
        position: "absolute",
        width: scale.m(291),
        height: scale.m(499),
        borderRadius: scale.m(19),
      };
    }
    if (cameraState == "NoState") {
      return {
        width: CameraCircleSize,
        height: CameraCircleSize,
        borderRadius: CameraCircleSize / 2,
      };
    }
    return {
      width: CameraCircleSize,
      height: CameraCircleSize,
      borderRadius: CameraCircleSize / 2,
    };
  }, [cameraState]);

  const animatedCameraStyle = useAnimatedStyle(() => {
    return {
      bottom: cameraYPosition.value,
      opacity: cameraVisible.value,
      position: "absolute",
      overflow: "hidden",
      zIndex: 2, // Ensure camera is above the trigger button
    };
  });

  const handleGestureOnJS = (
    type: "begin" | "update" | "end",
    payload?: any,
  ) => {
    "worklet";
    if (cameraRef.current) {
      cameraRef.current.handleGesture(type, payload);
    }
  };
  const handleGestureSafe = useMemo(
    () => Worklets.createRunOnJS(handleGestureOnJS),
    [],
  );
  //Gesture Handling
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      handleGestureSafe("begin");
    })
    .onUpdate((e) => {
      handleGestureSafe("update", {
        x: e.translationX,
        y: e.translationY,
      });
    })
    .onFinalize(() => {
      handleGestureSafe("end");
    });
  if (cameraState == "PreviewSendState" && capturedVideoRef.current) {
    return (
      <View style={[containerStyle, {}]}>
        <AppVideoPlayer
          style={{
            width: CameraRecordingWidth,
            height: CameraRecordingHeight,
            borderRadius: scale.m(19),
            marginTop: scale.m(50),
          }}
          source={capturedVideoRef.current.videoPath}
          shouldPlay
          shouldLoad
          muted
          loop
        />
        <View
          style={{
            flexDirection: "row",
            marginTop: scale.m(80),
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: scale.h(8),
            width: CameraRecordingWidth,
          }}
        >
          <TouchableOpacity
            style={[styles.cancelWrapper]}
            onPress={cancelCapturing}
          >
            <CrossIcon />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sendWrapper]}>
            <SendIcon />
          </TouchableOpacity>
          <View style={{ width: scale.m(32), height: scale.m(32) }} />
        </View>
      </View>
    );
  }
  return (
    <GestureDetector gesture={panGesture}>
      <View style={[containerStyle, cameraContainerStyle]}>
        <Animated.View style={[animatedCameraStyle, cameraStateStyle]}>
          <AppCamera
            ref={cameraRef}
            forCapture={true}
            cameraIsActive={isFocused}
            onVideoCaptured={handleVideoCaptured}
          />
        </Animated.View>

        <Pressable
          style={[styles.cameraWrapper, cameraButtonStyle]}
          onPress={handleSinglePress}
          hitSlop={scale.m(15)}
          onLongPress={handleLongPress}
          onPressOut={handleLongPressEnd}
        >
          {cameraState == "RecordingState" && (
            <View
              style={{
                width: scale.m(72),

                height: scale.m(72),
                borderRadius: scale.m(36),
                backgroundColor: "rgba(255, 255, 255, 1)",
              }}
            />
          )}
        </Pressable>
        {cameraState == "ActionState" && (
          <DoubleIcon
            onCameraFlash={() => {}}
            onCameraRotate={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              cameraRef.current?.toggleCamera();
            }}
            positionFromBottom={getActionIconPositionFromBottom("ActionState")}
          />
        )}
        {cameraState == "ActionState" && (
          <Text
            style={{
              position: "absolute",
              bottom: cameraWrapperPositionFromBottom - scale.m(42),
              fontFamily: "SN Pro",
              fontWeight: "600",
              fontSize: scale.m(16),
              textAlign: "center",
              color: "rgba(255, 255, 255, 1)",
            }}
          >
            Hold longer to record
          </Text>
        )}
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: CameraContainerHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale.m(24),
    zIndex: 10,
  },
  cancelWrapper: {
    width: scale.m(32),
    height: scale.m(32),
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: scale.m(16),
    justifyContent: "center",
    alignItems: "center",
  },
  sendWrapper: {
    width: scale.m(80),
    height: scale.m(80),
    borderRadius: scale.m(40),

    justifyContent: "center",
    alignItems: "center",
    paddingLeft: scale.v(4),
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  cameraWrapper: {
    overflow: "hidden",
    width: CameraWrapperSize,
    height: CameraWrapperSize,
    borderRadius: scale.m(CameraWrapperSize / 2),
    borderWidth: CameraWrapperBorderWidth,
    borderColor: "#fff",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
