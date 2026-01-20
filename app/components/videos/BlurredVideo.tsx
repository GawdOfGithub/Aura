import {
  Blur,
  Fill,
  ImageShader,
  Canvas as SkiaCanvas,
  useVideo,
} from "@shopify/react-native-skia";
import React, { useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { SharedValue } from "react-native-reanimated";

interface BlurredVideoProps {
  source: string;
  isMuted?: boolean;
  isLooped?: boolean;
  blurRadius?: number;
  videoPaused?: SharedValue<boolean>;
  style?: StyleProp<ViewStyle>;
  width?: number;
  height?: number;
  onReady?: () => void;
}

const BlurredVideo = ({
  source,
  isMuted = false,
  isLooped = false,
  blurRadius = 7,
  style,
  videoPaused,
  width = 350,
  height = 270,
  onReady,
}: BlurredVideoProps) => {
  // 4. Get Video Frame for Skia
  const { currentFrame } = useVideo(source, {
    looping: isLooped,
    volume: isMuted ? 0 : 1,
    paused: videoPaused,
  });

  useEffect(() => {
    if (currentFrame && onReady) {
      onReady();
    }
  }, [currentFrame, onReady]);
  return (
    <SkiaCanvas style={[{ flex: 1 }, style]}>
      <Fill>
        <ImageShader
          image={currentFrame}
          x={0}
          y={0}
          width={width}
          height={height}
          fit="cover"
        />
        <Blur blur={blurRadius} />
      </Fill>
    </SkiaCanvas>
  );
};

export default BlurredVideo;
