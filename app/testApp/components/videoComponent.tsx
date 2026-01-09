import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export const VideoBubble = ({
  videoUri,
  videoCreatedBy,
}: {
  videoUri: string;
  videoCreatedBy: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = false;
    p.muted = true;
  });

  const floatValue = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    floatValue.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -10,
      true
    );

    const subscription = player.addListener("playToEnd", () => {
      closeModal();
    });

    return () => subscription.remove();
  });

  const openModal = () => {
    setIsVisible(true);
    player.muted = false;
    player.currentTime = 0;
    player.play();
  };

  const closeModal = () => {
    player.pause();
    player.muted = true;
    setIsVisible(false);
    translateY.value = 0;
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 150) {
        runOnJS(closeModal)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedBubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatValue.value }],
  }));

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={{ alignItems: "center" }}
        onPress={openModal}
      >
        <Animated.View style={[styles.bubble, animatedBubbleStyle]}>
          <VideoView
            player={player}
            style={styles.video}
            contentFit='cover'
            nativeControls={false}
          />
        </Animated.View>
        <Text style={styles.username}>{videoCreatedBy}</Text>
      </Pressable>

      <Modal visible={isVisible} transparent animationType='fade'>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.fullScreen, animatedModalStyle]}>
              <View style={styles.blackBackdrop} />

              <VideoView
                player={player}
                style={styles.fullVideo}
                contentFit='contain'
                nativeControls={false}
              />

              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { margin: 15, alignItems: "center" },
  bubble: {
    width: 80,
    height: 80,
    borderRadius: 45,
    backgroundColor: "#1A1A1A",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  username: {
    color: "#fff",
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
  },
  video: { width: "100%", height: "100%" },

  fullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  blackBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.95)",
    zIndex: -1,
  },
  fullVideo: {
    width: width,
    height: width,
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 30,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 24,
  },
});









