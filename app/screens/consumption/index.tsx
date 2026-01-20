import EmojiKeyBoard from "@/app/components/emoji-keyboard";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EmojiType } from "rn-emoji-keyboard";

const Consumption = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiType | null>(null);

  console.log(selectedEmoji, "selectedEmoji");

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        style={{
          width: 100,
          height: 100,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#fff",
        }}
      >
        <Text style={{ color: "white", fontSize: 20 }}>
          {selectedEmoji ? `${selectedEmoji.emoji}` : `Press here`}
        </Text>

        <EmojiKeyBoard
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
          }}
          onEmojiSelected={(emoji: EmojiType) => {
            setSelectedEmoji(emoji);
            setIsOpen(false);
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Consumption;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
});
