import { SeamlessCamera } from "@/app/testApp/cameraSceen";
import { NavigationProp } from "@react-navigation/native";

import React from "react";
import { StyleSheet, View } from "react-native";
import { CameraFlipIcon, FlashToggleIcon } from "../../../assets/images/svg";
import { scale } from "../../../utility/responsive";
import { IconButton } from "../../Buttons";

interface CameraControlsProps {
  onFlashlightPress?: () => void;
  onRotateCameraPress?: () => void;
  onVideoCaptured: (path: string) => void;
  navigation: NavigationProp<any>;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  onFlashlightPress,
  onRotateCameraPress,
  onVideoCaptured,
  navigation,
}) => {
  return (
    <View style={styles.container}>
      <IconButton
        onPress={onFlashlightPress}
        Icon={FlashToggleIcon}
        width={60}
        height={60}
        borderRadius={36}
        borderWidth={2}
        borderColor="rgba(255, 255, 255, 0.12)"
        iconWidth={16.667}
        iconHeight={16.667}
      />

      <View style={[styles.cameraWrapper, styles.cameraSmall]}>
        <SeamlessCamera
          isExpanded={false}
          onExpand={() => {}}
          onClose={() => {}}
          navigation={navigation}
          onVideoCaptured={onVideoCaptured}
        />
      </View>

      <IconButton
        onPress={onRotateCameraPress}
        Icon={CameraFlipIcon}
        width={60}
        height={60}
        borderRadius={36}
        borderWidth={2}
        borderColor="rgba(255, 255, 255, 0.12)"
        iconWidth={16.667}
        iconHeight={16.667}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: scale.m(244),
    height: scale.m(118),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale.m(24),
    marginTop: scale.v(30),
    marginBottom: scale.v(40),
  },

  cameraWrapper: {
    overflow: "hidden",
  },
  cameraSmall: {
    width: 102,
    height: 102,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: "#fff",
    padding: 6,
  },
});
