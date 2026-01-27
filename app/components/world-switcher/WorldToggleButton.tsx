import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { scale } from "../../utility/responsive";

import { GlobeIcon, WorldSwitcherBackground } from "../../assets/images/svg";

interface WorldToggleButtonProps {
  onPress?: () => void;
  footerPositionFromBottom: number;
}
const WorldContainerHeight = scale.m(80);

export const WorldToggleButton: React.FC<WorldToggleButtonProps> = ({
  onPress,
  footerPositionFromBottom,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { position: "absolute", bottom: footerPositionFromBottom },
      ]}
    >
      <WorldSwitcherBackground width="100%" height={scale.m(56)} />
      <GlobeIcon style={styles.icon} width={scale.m(32)} height={scale.m(32)} />
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: WorldContainerHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    width: "100%",
    height: "100%",
  },
  icon: {
    width: scale.m(32),
    height: scale.m(32),
    position: "absolute",
    zIndex: 10,
  },
});
