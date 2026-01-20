import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { scale } from "../../utility/responsive";

interface IconButtonProps {
  onPress?: () => void;
  Icon: React.ComponentType<any>;
  width?: number;
  height?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
  iconWidth?: number;
  iconHeight?: number;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  Icon,
  width = 40,
  height = 40,
  borderRadius = 35,
  borderWidth = 1.5,
  borderColor = "rgba(255, 255, 255, 0.04)",
  backgroundColor = "rgba(255, 255, 255, 0.08)",
  iconWidth = 24,
  iconHeight = 24,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.buttonContainer,
        {
          width: scale.m(width),
          height: scale.m(height),
          borderRadius: scale.m(borderRadius),
          borderWidth: scale.m(borderWidth),
          borderColor,
          backgroundColor,
        },
        style,
      ]}
    >
      <View style={styles.iconContainer}>
        <Icon width={scale.m(iconWidth)} height={scale.m(iconHeight)} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
});
