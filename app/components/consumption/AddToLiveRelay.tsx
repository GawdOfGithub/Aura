import { DownArrowIcon } from "@/app/assets/images/svg";
import { useGetCurrentUserInfoQuery } from "@/app/store/features/users/userApi";
import { scale } from "@/app/utility/responsive";
import { getVideoHeightFromWidth } from "@/app/utility/videoSizeInfo";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CountdownTimer from "../time/CountdownTimer";
import StaticTimeAgo from "../time/StaticTime";

const AddToLiveRelay = ({ relayEndTime }: { relayEndTime: string }) => {
  const navigation = useNavigation();
  const { profilePhoto } = useGetCurrentUserInfoQuery(undefined, {
    selectFromResult: ({ data }) => ({
      profilePhoto: data?.profilePhoto,
    }),
  });
  return (
    <View
      style={{
        height: getVideoHeightFromWidth(),
        width: "100%",
        backgroundColor: "rgba(0,0,0,.74)",
      }}
      // onPress={handlePlayPauseForReaction}
    >
      <ImageBackground
        source={{ uri: profilePhoto }}
        resizeMode="cover"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          zIndex: -1,
        }}
      />
      <View style={[styles.videoLiveHeader, { marginTop: scale.v(50) }]}>
        <StaticTimeAgo relayState={"live"} inputTime={""} />
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <DownArrowIcon />
        </TouchableOpacity>
      </View>
      <View style={styles.AddLiveBottomPanel}>
        <CountdownTimer
          relayEndTime={relayEndTime}
          isActive={true}
          relayState="live"
          textStyle={{ fontSize: scale.f(40) }}
        />
        <Text style={{ color: "#ffffff", fontSize: scale.f(18) }}>
          Hold to talk
        </Text>
      </View>
    </View>
  );
};

export default AddToLiveRelay;

const styles = StyleSheet.create({
  videoLiveHeader: {
    height: scale.m(42),
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale.h(16),
  },
  AddLiveBottomPanel: {
    width: scale.m(104),
    height: scale.m(65),
    position: "absolute",
    bottom: 150,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
});
