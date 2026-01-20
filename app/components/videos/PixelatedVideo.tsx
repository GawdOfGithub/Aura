import {
  Fill,
  ImageShader,
  RuntimeShader,
  Skia,
  Canvas as SkiaCanvas,
  useVideo,
} from "@shopify/react-native-skia";
import React, { useEffect, useMemo } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
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
  resolutionScale?: number; // Lower = Faster performance, Higher = Sharper "sub-pixels"
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
  resolutionScale = 0.5,
  onReady,
}: PixelatedVideoProps) => {
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

  // --- OPTIMIZATION LOGIC ---

  // 1. Calculate the smaller "physical" size for the canvas
  const internalWidth = width * resolutionScale;
  const internalHeight = height * resolutionScale;

  // 2. Adjust the shader's pixel size
  // Because we shrank the canvas, we need to shrink the pixel block size
  // relative to the canvas so it looks the same size visually after scaling up.
  const adjustedPixelSize = pixelSize * resolutionScale;

  // 3. Create the transformation style to scale it back up visually
  const transformStyle = useMemo(
    () => ({
      width: internalWidth,
      height: internalHeight,
      transform: [
        { scaleX: 1 / resolutionScale },
        { scaleY: 1 / resolutionScale },
      ],
      transformOrigin: "top left",
    }),
    [internalWidth, internalHeight, resolutionScale],
  );

  return (
    <View style={[{ width, height, overflow: "hidden" }, style]}>
      <SkiaCanvas style={transformStyle}>
        <Fill>
          <RuntimeShader
            source={pixelateShader}
            uniforms={{ pixelSize: adjustedPixelSize }}
          >
            <ImageShader
              image={currentFrame}
              x={0}
              y={0}
              width={internalWidth}
              height={internalHeight}
              fit="cover"
            />
          </RuntimeShader>
        </Fill>
      </SkiaCanvas>
    </View>
  );
};

export default PixelatedVideo;
