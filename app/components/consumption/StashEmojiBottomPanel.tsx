import { DiamondIcon, EmojiIcon } from "@/app/assets/images/svg";
import { scale } from "@/app/utility/responsive";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { IconButton } from "../buttons";
import { CameraWrapperSize } from "../camera/CameraControls";

const { width } = Dimensions.get("window");
type StashEmojiBottomPanelProps = {
  isActive?: boolean;
  onEmojiClick: () => void;
  onStashClick: () => void;
};
const StashEmojiBottomPanel = ({
  isActive = true,
  onEmojiClick,
  onStashClick,
}: StashEmojiBottomPanelProps) => {
  return (
    <View style={[styles.container, { height: CameraWrapperSize }]}>
      <IconButton
        onPress={onStashClick}
        Icon={DiamondIcon}
        width={60}
        height={60}
        borderRadius={30}
        isActive={isActive}
      />
      <IconButton
        onPress={onEmojiClick}
        Icon={EmojiIcon}
        width={60}
        height={60}
        borderRadius={30}
        isActive={isActive}
      />
    </View>
  );
};

export default StashEmojiBottomPanel;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: width,
    bottom: scale.m(140),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale.h(40),
    justifyContent: "space-between",
    zIndex: 10,
  },
});
