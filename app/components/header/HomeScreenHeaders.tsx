import { useGetCurrentUserInfoQuery } from "@/app/store/features/users/userApi";
import React from "react";
import {
  DimensionValue,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BellIcon } from "../../assets/images/svg";
import { scale } from "../../utility/responsive";
import { IconButton } from "../buttons";

interface HomeScreenHeadersProps {
  onProfilePress?: () => void;
  onStarPress?: () => void;
  groupName?: string;

  headerHeight: DimensionValue;
}

export const HomeScreenHeaders: React.FC<HomeScreenHeadersProps> = ({
  onProfilePress,
  onStarPress,
  headerHeight,
  groupName = "",
}) => {
  const { profilePhoto } = useGetCurrentUserInfoQuery(undefined, {
    selectFromResult: ({ data }) => ({
      profilePhoto: data?.profilePhoto,
    }),
  });

  return (
    <View style={[styles.container, { height: headerHeight }]}>
      <View style={styles.content}>
        <TouchableOpacity onPress={onProfilePress} style={styles.profileButton}>
          <View style={styles.profileButtonGradient}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: profilePhoto }}
                style={styles.profileImage}
              />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.badgeContainer}>
          <View style={styles.badgeGradient}>
            <Text style={styles.badgeText}>{groupName}</Text>
          </View>
        </View>

        <IconButton onPress={onStarPress} Icon={BellIcon} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: scale.v(106),
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.79266,
  },
  content: {
    position: "absolute",
    top: scale.v(43),
    width: "100%",
    paddingHorizontal: scale.h(16),
    paddingLeft: scale.h(28),
    paddingRight: scale.h(4),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: scale.v(40),
  },
  profileButton: {
    width: scale.m(40),
    height: scale.m(40),
    borderRadius: scale.m(41.25),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 2,
  },
  profileButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageContainer: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    borderRadius: scale.m(41.25),
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  badgeContainer: {
    height: scale.v(32),
    paddingHorizontal: scale.h(16),
    borderRadius: scale.m(36),
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.04)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 2,
  },
  badgeGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: scale.fontFixed(16),
    lineHeight: scale.m(22),
    color: "rgba(255, 255, 255, 0.80)",
    fontWeight: "500",
  },
});
