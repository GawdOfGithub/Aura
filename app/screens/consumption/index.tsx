import BlurredVideo from "@/app/components/videos/blurredVideo";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
const videoSource =
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4";
const ConsumptionScreen = ({}) => {
  const videoPaused = useSharedValue(true);

  const { width, height } = Dimensions.get("window");
  const [expoReady, setExpoReady] = useState(false);
  const [skiaReady, setSkiaReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoPlayer = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.muted = true;
  });
  const handleStartStop = (isVideoPlaying: boolean) => {
    console.log("check isVideoPlaying", isVideoPlaying);
    if (!isVideoPlaying) {
      videoPaused.value = false;
      videoPlayer.play();
      setIsVideoPlaying(true);
      console.log(" stoped");
    } else {
      videoPaused.value = true;
      videoPlayer.pause();
      setIsVideoPlaying(false);
    }
  };
  useEffect(() => {
    const subscription = videoPlayer.addListener("statusChange", (payload) => {
      // readyToPlay means metadata is loaded and frame 0 is ready
      if (payload.status === "readyToPlay") {
        setExpoReady(true);
      }
    });
    return () => subscription.remove();
  }, [videoPlayer]);

  useEffect(() => {
    if (expoReady && skiaReady && !isVideoPlaying) {
      // Play Skia
      videoPaused.value = false;

      // Play Expo
      videoPlayer.play();

      setIsVideoPlaying(true);
    }
  }, [expoReady, skiaReady, videoPlayer]);
  return (
    <View style={styles.container}>
      <BlurredVideo
        videoPaused={videoPaused}
        style={{
          position: "absolute",
          width: "100%",
          height: height,
        }}
        blurRadius={20}
        width={width}
        height={height + 15}
        onReady={() => setSkiaReady(true)}
        source={videoSource}
      />
      <TouchableOpacity
        onPress={() => handleStartStop(isVideoPlaying)}
        activeOpacity={0.7}
        style={{
          width: 359,
          height: 359,
          marginTop: 150,
          borderWidth: 0.96,
          borderColor: "rgba(255, 255, 255, 0.24)",
          borderRadius: 180,
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <VideoView
          player={videoPlayer}
          contentFit="cover"
          nativeControls={false}
          style={[StyleSheet.absoluteFill, { height: 359 }]}
        />
      </TouchableOpacity>
    </View>
  );
};

export default ConsumptionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    width: 359,
    aspectRatio: 1,
  },
});
