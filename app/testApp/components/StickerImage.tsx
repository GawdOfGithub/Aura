import React from "react";
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
} from "react-native";
import DropShadow from "react-native-drop-shadow";

interface StickerImageProps {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  borderColor?: string;
  borderWidth?: number;
}

export const StickerImage: React.FC<StickerImageProps> = ({
  source,
  style,
  borderColor = "#ffffff",
  borderWidth = 4,
}) => {
  const imageSize = 400;

  return (
    <DropShadow
      style={{
        shadowColor: borderColor,
        shadowOffset: { width: borderWidth, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 0.5,
      }}
    >
      <DropShadow
        style={{
          shadowColor: borderColor,
          shadowOffset: { width: -borderWidth, height: -borderWidth },
          shadowOpacity: 1,
          shadowRadius: 0.5,
        }}
      >
        <Image
          source={source}
          style={[
            {
              width: imageSize,
              height: imageSize,
            },
            style,
          ]}
          resizeMode="contain"
        />
      </DropShadow>
    </DropShadow>
  );
};

export default StickerImage;
