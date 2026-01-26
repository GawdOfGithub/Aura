import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import CameraFlipIcon from "../../assets/images/svg/CameraFlipIcon";
import FlashToggleIcon from "../../assets/images/svg/FlashToggleIcon";
import { scale } from "../../utility/responsive";

interface DoubleIconProps {
  onCameraFlash: () => void;
  onCameraRotate: () => void;
  positionFromBottom: number;
}

// 2. Accept the prop
export const DoubleIcon: React.FC<DoubleIconProps> = ({
  onCameraFlash,
  onCameraRotate,
  positionFromBottom,
}) => {
  const iconSize = scale.m(24);
  return (
    <View style={[styles.container, { bottom: positionFromBottom }]}>
      <TouchableOpacity
        onPress={onCameraFlash}
        style={{ height: iconSize, width: iconSize }}
      >
        <FlashToggleIcon height={iconSize} width={iconSize} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onCameraRotate}
        style={{ height: iconSize, width: iconSize }}
      >
        <CameraFlipIcon height={iconSize} width={iconSize} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: scale.v(250),
    flexDirection: "row",
    borderRadius: scale.m(32),
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: 20,
    width: scale.m(116),
    height: scale.m(56),
    backgroundColor: "#FFFFFF24",
    alignItems: "center",
    justifyContent: "center",
  },
});
