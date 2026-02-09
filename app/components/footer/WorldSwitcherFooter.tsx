// /home/anurag/video-chat-practice/app/components/dpHelpers
import CloseIcon from "@/app/assets/images/svg/CloseIcon";
import { IconButton } from "@/app/components/buttons/IconButton";
import { RootStackParamList } from "@/app/types/navigation";
import { scale } from "@/app/utility/responsive";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BlurView } from "@sbaiahmed1/react-native-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import NewGroupBottomSheet from "../world-switcher/NewGroupBottomSheet";

const { width } = Dimensions.get("window");

const PlusIcon = (props: any) => (
  <CloseIcon
    {...props}
    style={[props.style, { transform: [{ rotate: "45deg" }] }]}
  />
);

export const WorldSwitcherFooter = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const handleOpenPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <>
      <View style={styles.absoluteContainer} pointerEvents="box-none">
        {isFocused && (
          <View style={StyleSheet.absoluteFill}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="dark"
              blurAmount={30}
            />
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.85)"]}
              locations={[0, 0.8]}
              style={StyleSheet.absoluteFill}
            />
          </View>
        )}

        <View style={styles.footerContent}>
          <View style={styles.actionItem}>
            <IconButton
              Icon={CloseIcon}
              width={60}
              height={60}
              borderRadius={900}
              iconWidth={28}
              iconHeight={28}
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.label}>Close</Text>
          </View>

          <View style={styles.actionItem}>
            <IconButton
              Icon={PlusIcon}
              width={60}
              height={60}
              borderRadius={36}
              iconWidth={26.5}
              iconHeight={26.5}
              onPress={handleOpenPress}
            />
            <Text style={styles.label}>New group</Text>
          </View>
        </View>
      </View>

      {isFocused && <NewGroupBottomSheet ref={bottomSheetRef} />}
    </>
  );
};

const styles = StyleSheet.create({
  absoluteContainer: {
    position: "absolute",
    bottom: 0,
    width: width,
    height: scale.v(160),
    justifyContent: "flex-end",
    zIndex: 10,
    overflow: "hidden",
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: scale.h(55),
    paddingBottom: scale.v(40),
    alignItems: "center",
    zIndex: 20,
  },
  actionItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: scale.m(12),
    fontWeight: "700",
    marginTop: scale.v(8),
    fontFamily: "SN Pro",
  },
});
