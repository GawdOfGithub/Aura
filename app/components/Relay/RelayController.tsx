import React from "react";
import { StyleSheet, View } from "react-native";
import { scale } from "../../utility/responsive";
interface RelayControllerProps {
  activeIndex?: number;
  totalItems?: number;
}

export const RelayController: React.FC<RelayControllerProps> = ({
  activeIndex = 0,
  totalItems = 3,
}) => {
  const activeBar = activeIndex % totalItems;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {Array.from({ length: totalItems }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeBar === index ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: scale.v(128),
    right: 0,
    borderTopLeftRadius: scale.m(12),
    borderBottomLeftRadius: scale.m(12),
    paddingHorizontal: scale.h(6),
    paddingVertical: scale.v(8),
    backgroundColor: "transparent",
  },
  content: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: scale.v(4),
  },
  dot: {
    width: scale.m(10),
    height: scale.m(2),
    borderRadius: scale.m(22),
  },
  dotInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.32)",
  },
  dotActive: {
    width: scale.m(20),
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
});
