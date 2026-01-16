import {
  Fill,
  ImageShader,
  RuntimeShader,
  Skia,
  Canvas as SkiaCanvas,
  useVideo,
} from "@shopify/react-native-skia";
import React, { useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { SharedValue } from "react-native-reanimated";

// 1. Define the Shader
const pixelateShaderString = `
uniform shader image;
uniform float pixelSize;

half4 main(float2 xy) {
  float2 coord = floor(xy / pixelSize) * pixelSize;
  return image.eval(coord);
}
`;
const pixelateShader = Skia.RuntimeEffect.Make(pixelateShaderString)!;

interface PixelatedVideoProps {
  source: string;
  isMuted?: boolean;
  isLooped?: boolean;
  pixelSize?: number;
  videoPaused?: SharedValue<boolean>;
  style?: StyleProp<ViewStyle>;
  width?: number;
  height?: number;
  onReady?: () => void;
}

const PixelatedVideo = ({
  source,
  isMuted = true,
  isLooped = false,
  pixelSize = 10,
  style,
  videoPaused,
  width = 350,
  height = 270,
  onReady,
}: PixelatedVideoProps) => {
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
        <RuntimeShader source={pixelateShader} uniforms={{ pixelSize }}>
          <ImageShader
            image={currentFrame}
            x={0}
            y={0}
            width={width}
            height={height}
            fit="cover"
          />
        </RuntimeShader>
      </Fill>
    </SkiaCanvas>
  );
};

export default PixelatedVideo;
