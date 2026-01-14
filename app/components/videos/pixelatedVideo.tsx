import {
  Fill,
  ImageShader,
  RuntimeShader,
  Skia,
  Canvas as SkiaCanvas,
  useVideo
} from "@shopify/react-native-skia";
import { useVideoPlayer, VideoPlayer } from "expo-video";
import React, { useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";

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
  style?: StyleProp<ViewStyle>;
  width?: number;
  height?: number;
}

const PixelatedVideo = ({
  source,
  isMuted = true,
  isLooped = false,
  pixelSize = 10,
  style,
  width = 350,
  height = 270,
}: PixelatedVideoProps) => {
  
  const player = useVideoPlayer(source, (playerInstance: VideoPlayer) => {
    playerInstance.play(); 
  });

  useEffect(() => {
    if (player) {
      player.loop = isLooped;
      player.muted = isMuted;
    }
  }, [player, isLooped, isMuted]); 

  // 4. Get Video Frame for Skia
  const { currentFrame } = useVideo(source,{
    looping:isLooped
  });

  return (
    <SkiaCanvas style={[{flex:1},style]}>
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