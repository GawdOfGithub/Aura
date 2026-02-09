import Dice from "@/app/assets/images/svg/Dice";
import CreateGroupHeader from "@/app/components/header/CreateGroupHeader";
import { scale } from "@/app/utility/responsive";
import React, { useEffect, useRef, useState } from "react";
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

interface GroupNameScreenProps {
  users: any[];
  onBack: () => void;
  onClose: () => void;
}

export default function GroupNameScreen({
  users,
  onBack,
  onClose,
}: GroupNameScreenProps) {
  const [groupName, setGroupName] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [placeholderWidth, setPlaceholderWidth] = useState(scale.m(200));

  const inputRef = useRef<TextInput>(null);

  const isPlaceholderVisible = groupName.length === 0;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const getValidationState = () => {
    if (groupName.length === 0) return { isValid: false, error: null };

    try {
      const emojiRegex = /\p{Extended_Pictographic}/u;
      const hasEmoji = emojiRegex.test(groupName);

      const hasAlphanumeric = /[\p{L}\p{N}]/u.test(groupName);

      const nonEmojiContent = groupName
        .replace(/\p{Extended_Pictographic}/gu, "")
        .trim();

      if (hasEmoji && nonEmojiContent.length === 0) {
        return { isValid: false, error: "All entries can't be emojis" };
      }

      if (!hasEmoji && !hasAlphanumeric) {
        return {
          isValid: false,
          error: "All entries can't be special characters",
        };
      }
    } catch (e) {}

    if (groupName.length > 20) {
      return { isValid: false, error: "Too long!" };
    }
    if (groupName.length < 3) {
      return { isValid: false, error: "Too short!" };
    }

    return { isValid: true, error: null };
  };

  const { isValid, error } = getValidationState();

  return (
    <View style={styles.container}>
      <CreateGroupHeader title="New chat" onBack={onBack} onClose={onClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? scale.v(10) : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <View style={styles.centerContent}>
              <View style={styles.avatarContainer}>
                {users.slice(0, users.length > 4 ? 3 : 4).map((user, index) => (
                  <Image
                    key={user.id}
                    source={
                      typeof user.image === "string"
                        ? { uri: user.image }
                        : user.image
                    }
                    style={[
                      styles.avatar,
                      {
                        marginLeft: index === 0 ? 0 : scale.m(-15),
                        zIndex: index,
                      },
                    ]}
                  />
                ))}
                {users.length > 4 && (
                  <View
                    style={[
                      styles.avatar,
                      styles.overflowBubble,
                      {
                        marginLeft: scale.m(-15),
                        zIndex: 3,
                      },
                    ]}
                  >
                    <Text style={styles.overflowText}>+{users.length - 3}</Text>
                  </View>
                )}
              </View>

              <Pressable
                style={styles.inputWrapper}
                onPress={() => inputRef.current?.focus()}
              >
                {isPlaceholderVisible && (
                  <View
                    style={styles.placeholderContainer}
                    pointerEvents="none"
                  >
                    <View style={styles.placeholderContent}>
                      <Image
                        source={require("@/app/assets/images/png/Placeholder.gif")}
                        style={styles.placeholderImage}
                        resizeMode="cover"
                      />
                      <Text
                        style={styles.placeholderText}
                        onLayout={(e) =>
                          setPlaceholderWidth(e.nativeEvent.layout.width)
                        }
                      >
                        Enter group name
                      </Text>
                    </View>
                  </View>
                )}

                <TextInput
                  ref={inputRef}
                  style={[
                    styles.textInput,
                    {
                      textAlign: isPlaceholderVisible ? "left" : "center",
                      width: isPlaceholderVisible
                        ? placeholderWidth + scale.m(10)
                        : "100%",
                    },
                  ]}
                  placeholder=""
                  placeholderTextColor="transparent"
                  value={groupName}
                  onChangeText={setGroupName}
                  autoFocus={false}
                  selectionColor={"rgba(255, 87, 25, 1)"}
                  textAlignVertical="center"
                />
              </Pressable>

              {error && <Text style={styles.redText}>{error}</Text>}
            </View>

            <View style={styles.bottomSection}>
              {!isKeyboardVisible && (
                <TouchableOpacity style={styles.pickForMeButton}>
                  <Dice style={{ width: scale.m(28), height: scale.v(28) }} />
                  <Text style={styles.pickForMeText}>Pick for me</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                disabled={!isValid}
                style={[
                  styles.createButton,
                  isValid && styles.createButtonActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.createButtonText,
                    isValid && styles.createButtonTextActive,
                  ]}
                >
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: scale.v(50),
  },
  redText: {
    color: "rgba(255, 50, 32, 1)",
    fontFamily: "SN-Pro-Bold",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginTop: scale.v(4),
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale.m(20),
    gap: scale.v(8),
  },
  avatarContainer: {
    flexDirection: "row",
    marginBottom: scale.v(25),
  },
  avatar: {
    width: scale.m(56),
    height: scale.m(56),
    borderRadius: scale.m(28),
    borderWidth: 2,
    borderColor: "#000",
  },
  overflowBubble: {
    backgroundColor: "#1F1F1F",
    justifyContent: "center",
    alignItems: "center",
  },
  overflowText: {
    color: "#FFF",
    fontSize: scale.m(18),
    fontFamily: "SN-Pro-Bold",
    fontWeight: "700",
  },
  inputWrapper: {
    width: scale.m(343),
    height: scale.v(76),
    backgroundColor: "rgba(31, 31, 31, 1)",
    borderRadius: scale.m(16),
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  placeholderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  placeholderContent: {
    alignSelf: "center",
    overflow: "hidden",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    opacity: 0.4,
  },
  placeholderText: {
    padding: 0,
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: scale.m(24),
    fontFamily: "SN-Pro-Bold",
    fontWeight: "700",
    zIndex: 0,
  },
  textInput: {
    color: "#FFFFFF",
    fontSize: scale.m(24),
    fontFamily: "SN-Pro-Bold",
    fontWeight: "700",
    lineHeight: scale.m(24),
    letterSpacing: scale.m(-0.72),
    paddingVertical: 0,
    includeFontPadding: false,
    zIndex: 1,
  },
  bottomSection: {
    alignItems: "center",
    paddingHorizontal: scale.m(20),
    paddingBottom: scale.v(20),
  },
  pickForMeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#rgba(0, 0, 0, 0)",
    paddingVertical: scale.v(10),
    paddingHorizontal: scale.m(16),
    borderRadius: scale.m(35),
    marginBottom: scale.v(20),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    width: scale.m(153),
    height: scale.m(48),
  },
  pickForMeText: {
    color: "#FFF",
    fontSize: scale.m(14),
    fontWeight: "600",
  },
  createButton: {
    width: "100%",
    backgroundColor: "rgba(255, 87, 25, 0.32)",
    height: scale.v(52),
    borderRadius: scale.m(35),
    borderColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale.v(47),
    paddingVertical: scale.v(10),
  },
  createButtonActive: {
    backgroundColor: "rgba(255, 87, 25, 1)",
  },
  createButtonText: {
    color: "rgba(255, 255, 255, 0.32)",
    fontSize: scale.m(18),
    fontWeight: "bold",
  },
  createButtonTextActive: {
    color: "rgba(255, 255, 255, 1)",
  },
});