import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FavoriteIcon } from "../../assets/images/svg";
import { scale } from "../../utility/responsive";
import { IconButton } from "../Buttons";

const imgImage465 = require("../../../assets/images/png/test_image.png");

interface HomeScreenHeadersProps {
  onBackPress?: () => void;
  onStarPress?: () => void;
  groupName?: string;
  profileImage?: string;
}

export const HomeScreenHeaders: React.FC<HomeScreenHeadersProps> = ({
  onBackPress,
  onStarPress,
  groupName = "Blr Peeps",
  profileImage = imgImage465,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(16, 16, 16, 1)", "rgba(16, 16, 16, 0.04)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientOverlay}
      />
      <View style={styles.content}>
        <TouchableOpacity onPress={onBackPress} style={styles.profileButton}>
          <View style={styles.profileButtonGradient}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
                contentFit="cover"
              />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.badgeContainer}>
          <View style={styles.badgeGradient}>
            <Text style={styles.badgeText}>{groupName}</Text>
          </View>
        </View>

        <IconButton onPress={onStarPress} Icon={FavoriteIcon} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: scale.m(375),
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
