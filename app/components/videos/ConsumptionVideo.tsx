import { DownArrowIcon } from "@/app/assets/images/svg";
import { CREATE_VIDEO_NOTE } from "@/app/screens/consumption";
import { colors } from "@/app/theme";
import { AppPost, RelayState, UserReaction } from "@/app/types";
import { scale } from "@/app/utility/responsive";
import { getFirstName } from "@/app/utility/stringUtility";
import { formatTime12hWithDay } from "@/app/utility/timeFuctions";
import { getVideoHeightFromWidth } from "@/app/utility/videoSizeInfo";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AddToLiveRelay from "../consumption/AddToLiveRelay";
import UserPhoto from "../profile/UserPhoto";
import VideoOverlayText from "../text-components/VideoOverlayText";
import StaticTimeAgo from "../time/StaticTime";
import AppVideoPlayer from "./AppVideoPlayer";

interface ConsumptionVideoContainerProps {
  videoPost: AppPost;
  relayState: RelayState;
  videoSeenData: UserReaction[];
  isFocused: boolean;
  shouldLoad: boolean;
  relayEndTime: string;
}
const { width, height } = Dimensions.get("window");

const ConsumptionVideoContainer = ({
  videoPost,
  relayState,
  videoSeenData,
  isFocused,
  shouldLoad,
  relayEndTime,
}: ConsumptionVideoContainerProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [showReaction, setShowReaction] = useState(false);

  useEffect(() => {
    if (isFocused) {
      setIsVideoPlaying(true);
    } else {
      setIsVideoPlaying(false);
    }
  }, [isFocused]);

  const handlePlayPauseForReaction = () => {
    setShowReaction((prev) => !prev);
  };

  const renderVideoItem = useCallback(
    ({ item, index }: { item: UserReaction; index: number }) => {
      return (
        <View
          key={index}
          style={{
            height: scale.m(40),
            width: width * 0.9,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: scale.v(24),
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <UserPhoto imgSource={item.user.profilePhoto} />
            <Text
              style={{
                fontSize: scale.f(18),
                color: colors.font[0],
                marginLeft: scale.h(7),
              }}
            >
              {item.user.name}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: scale.f(32) }}>{item.emoji}</Text>
          </View>
        </View>
      );
    },
    [],
  );
  const navigation = useNavigation();
  const effectiveShouldPlay = isFocused && isVideoPlaying && !showReaction;
  if (videoPost.id == CREATE_VIDEO_NOTE) {
    return <AddToLiveRelay relayEndTime={relayEndTime} />;
  }
  return (
    <Pressable
      style={styles.videoContainer}
      onPress={handlePlayPauseForReaction}
    >
      <AppVideoPlayer
        source={videoPost.videoFile}
        style={StyleSheet.absoluteFillObject}
        shouldLoad={shouldLoad}
        shouldPlay={effectiveShouldPlay}
      />
      <View style={[styles.videoLiveHeader, showReaction && { zIndex: 2 }]}>
        <StaticTimeAgo
          relayState={relayState}
          inputTime={videoPost.createdAt}
        />
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <DownArrowIcon />
        </TouchableOpacity>
      </View>
      <View style={[styles.videoSubHeader, showReaction && { zIndex: 2 }]}>
        <VideoOverlayText text={getFirstName(videoPost.createdBy.name)} />
        <VideoOverlayText
          style={{ marginTop: scale.v(2) }}
          text={formatTime12hWithDay(videoPost.createdAt)}
        />
      </View>
      {showReaction && (
        <View style={styles.reactionOverlay}>
          <View style={styles.reactionContainer}>
            <Text
              style={{
                fontSize: scale.f(14),
                color: colors.font[0],
                marginBottom: scale.v(17),
              }}
            >
              Seen by:
            </Text>
            <FlatList
              contentContainerStyle={{ width: width }}
              data={videoSeenData}
              renderItem={renderVideoItem}
              scrollEnabled={true}
            />
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default ConsumptionVideoContainer;

const styles = StyleSheet.create({
  videoContainer: {
    height: getVideoHeightFromWidth(),
    width: "100%",
    paddingTop: scale.v(50),
    backgroundColor: "red",
  },
  videoLiveHeader: {
    height: scale.m(42),
    width: width,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale.h(16),
  },
  videoSubHeader: {
    marginTop: scale.v(6),
    paddingLeft: scale.h(16),
  },
  reactionOverlay: {
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.72)",

    paddingTop: scale.v(160),
    ...StyleSheet.absoluteFillObject,
  },
  reactionContainer: {
    flex: 1,
    paddingHorizontal: scale.h(16),
    width: "100%",
  },
});
