import GroupIcon from "@/app/assets/images/svg/GroupIcon";
import NewChat from "@/app/assets/images/svg/NewChat";
import { RootStackParamList } from "@/app/types/navigation";
import { scale } from "@/app/utility/responsive";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { forwardRef, useCallback, useMemo } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity } from "react-native";
const { height } = Dimensions.get("window");

interface NewGroupBottomSheetProps {}

const NewGroupBottomSheet = forwardRef<
  BottomSheetModal,
  NewGroupBottomSheetProps
>((props, ref) => {
  const snapPoints = useMemo(() => [height * 0.43], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.9}
        pressBehavior="close"
      />
    ),
    [],
  );
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleJoinGroupPress = () => {
    navigation.navigate("JoinGroup");
  };
  const handleCreateGroupPress = () => {
    navigation.navigate("CreateGroup");
  };
  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.bottomSheetIndicator}
    >
      <BottomSheetView style={styles.mainContainer}>
        <TouchableOpacity style={styles.box} onPress={handleJoinGroupPress}>
          <GroupIcon style={styles.icons} />
          <Text
            style={styles.commonText}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Join group with code
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.box} onPress={handleCreateGroupPress}>
          <NewChat style={styles.icons} />
          <Text style={styles.commonText}>Create new group</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

NewGroupBottomSheet.displayName = "NewGroupBottomSheet";

export default NewGroupBottomSheet;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: scale.m(25),
  },
  bottomSheetBackground: {
    backgroundColor: "rgba(36, 36, 36, 0.87)",

    borderTopLeftRadius: scale.m(20),
    borderTopRightRadius: scale.m(20),
  },
  bottomSheetIndicator: {
    backgroundColor: "#FFFFFF",
    opacity: 0.5,
  },
  box: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.09)",
    width: scale.m(343),

    borderRadius: scale.m(32),
    marginVertical: scale.m(10),
    gap: scale.m(12),
    paddingVertical: scale.m(24),
  },
  icons: {
    width: scale.m(32),
    height: scale.m(32),
  },
  commonText: {
    textAlign: "center",
    lineHeight: scale.v(24),
    letterSpacing: scale.m(18) * -0.03,
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: scale.m(18),
    fontFamily: "SN Pro",
  },
});
