import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { scale } from "../../../utility/responsive";

import { GlobeIcon, WorldSwitcherBackground } from "../../../assets/images/svg";

interface WorldToggleButtonProps {
  onPress?: () => void;
}

export const WorldToggleButton: React.FC<WorldToggleButtonProps> = ({
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <WorldSwitcherBackground
        style={styles.background}
        width="100%"
        height="100%"
      />
      <GlobeIcon style={styles.icon} width={scale.m(32)} height={scale.m(32)} />
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  container: {
    width: scale.m(152),
    height: scale.v(56),
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
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
