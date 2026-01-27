import { scale } from "@/app/utility/responsive";
import React from "react";

import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

type UserPhotoProp = {
  bgStyle?: ViewStyle;
  imgStyle?: ViewStyle;
  imgSource: ImageSourcePropType;
};
const UserPhoto = ({ bgStyle, imgStyle, imgSource }: UserPhotoProp) => {
  return (
    <View
      style={[
        {
          width: scale.m(40),
          height: scale.m(40),
          borderRadius: scale.m(20),
          backgroundColor: "rgba(255, 255, 255, 0.2)",
        },
        bgStyle,
      ]}
    >
      <Image
        source={imgSource}
        style={{
          width: scale.m(40),
          height: scale.m(40),
          borderRadius: scale.m(20),
        }}
      />
    </View>
  );
};

export default UserPhoto;

const styles = StyleSheet.create({});
