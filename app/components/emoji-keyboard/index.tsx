import { scale } from "@/app/utility/responsive";
import React, { useMemo } from "react";
import { Dimensions, StyleSheet } from "react-native";
import EmojiPicker, {
  emojisByCategory,
  EmojisByCategory,
  EmojiType,
} from "rn-emoji-keyboard";
import { CategoryTypes } from "rn-emoji-keyboard/lib/typescript/types";
import { popularEmojis } from "./popularEmojis";

export type EmojiKeyboardProps = {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelected: (emoji: EmojiType) => void;
};
const EmojiKeyBoard = ({
  isOpen,
  onClose,
  onEmojiSelected,
}: EmojiKeyboardProps) => {
  const { height } = Dimensions.get("window");
  const customEmojisByCategory: EmojisByCategory[] = useMemo(() => {
    const filteredDefault = emojisByCategory.filter(
      (cat) => cat.title !== "recently_used",
    );
    return [
      {
        title: "recently_used" as CategoryTypes,
        data: popularEmojis,
      },
      ...filteredDefault,
    ];
  }, []);

  return (
    <EmojiPicker
      expandable={true}
      emojiSize={scale.moderate(40)}
      defaultHeight={height * 0.69}
      open={isOpen}
      onClose={onClose}
      enableSearchBar={false}
      enableRecentlyUsed={false}
      categoryPosition="bottom"
      //enableCategoryChangeGesture={true}
      disabledCategories={["symbols"]}
      //emojisByCategory={customEmojisByCategory} //solve for flicker
      onEmojiSelected={onEmojiSelected}
      theme={{
        container: "#232322",
        header: "#FFFFFFA3",
        knob: "rgba(255, 255, 255, 0.48)",
        category: {
          icon: "#EBEBF599",
          iconActive: "#EBEBF599",
          containerActive: "#7878805C",
        },
      }}
      styles={{
        header: {
          fontFamily: "Outfit-Regular",
          fontSize: scale.font(16),
        },
        knob: {
          height: 6,
          width: 63,
          top: 20,
          zIndex: 1,
          position: "absolute",
          backgroundColor: "#474747",
          borderRadius: 28,
          display: "flex",
        },
        container: {
          paddingTop: scale.vertical(24),
        },

        category: {
          container: {
            paddingTop: scale.v(30),
            borderTopColor: "#FFFFFF1F",
            borderWidth: scale.m(1),
            backgroundColor: "#232322",
            paddingBottom: 30,
          },
        },
      }}
    />
  );
};

export default EmojiKeyBoard;

const styles = StyleSheet.create({
  bottomsheetContainer: {},
});
