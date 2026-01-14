import {
    Blur,
    Fill,
    ImageShader,
    Skia,
    Canvas as SkiaCanvas,
    useVideo
} from "@shopify/react-native-skia";
import { useVideoPlayer, VideoPlayer } from "expo-video";
import React, { useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";

// 1. Define the Shader
const blurShaderString = `
uniform shader image;
uniform float pixelSize;

half4 main(float2 xy) {
  float2 coord = floor(xy / pixelSize) * pixelSize;
  return image.eval(coord);
}
`;
const blurShader = Skia.RuntimeEffect.Make(blurShaderString)!;

interface BlurredVideoProps {
  source: string;
  isMuted?: boolean;
  isLooped?: boolean;
  blurRadius?: number;
  style?: StyleProp<ViewStyle>;
  width?: number;
  height?: number;
}

const BlurredVideo = ({
  source,
  isMuted = false,
  isLooped = false,
  blurRadius = 7,
  style,
  width = 350,
  height = 270,
}: BlurredVideoProps) => {
  
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