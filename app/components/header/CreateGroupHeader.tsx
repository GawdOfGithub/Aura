// /home/anurag/video-chat-practice/app/components/header/CreateGroupHeader.tsx
import CloseIcon from "@/app/assets/images/svg/CloseIcon"
import ArrowSvg from "@/app/assets/images/svg/ArrowSvg"
import { scale } from "@/app/utility/responsive";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CreateGroupHeaderProps {
  onClose?: () => void;
  title?: string;
  onBack?: () => void;
}

const CreateGroupHeader: React.FC<CreateGroupHeaderProps> = ({
  onClose,
  title = "New chat",
  onBack,
}) => {
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity
          style={styles.headerIconPlaceholder}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <ArrowSvg style={{ width: scale.m(32), height: scale.v(32) }} />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerIconPlaceholder} />
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity
        style={styles.headerIconPlaceholder}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <View
          style={{
            width: 32,
            height: 32,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CloseIcon
            width="46%"
            height="46%"
            strokeWidth={4}
            strokeOpacity={1}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CreateGroupHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale.m(20),
    paddingBottom: scale.v(15),
  },
  headerIconPlaceholder: { width: 40, alignItems: "flex-end" },
  headerTitle: {
    fontFamily: "SN Pro",
    fontWeight: "700",
    fontSize: 20,
    lineHeight: 20,
    letterSpacing: -0.6,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.9)",
  },
});
