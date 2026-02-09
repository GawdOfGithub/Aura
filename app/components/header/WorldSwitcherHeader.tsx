import { scale } from "@/app/utility/responsive";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const WorldSwitcherHeader = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>hotline</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: scale.v(65),
    marginBottom: scale.v(65),
    marginHorizontal: scale.h(20),
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontFamily: "OpenRunde-Bold",
    fontWeight: "700",
    fontSize: scale.m(51.37),
    lineHeight: scale.m(58.71),
    textAlign: "center",
    color: "rgba(255, 87, 25, 1)",
    textShadowColor: "rgba(0, 0, 0, 0.32)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});

export default WorldSwitcherHeader;
