import React, { useEffect, useRef, useState } from "react";
import {
  InteractionManager,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import CloseIcon from "@/app/assets/images/svg/CloseIcon";
import TextHash from "@/app/assets/images/svg/TextHash";
import { RootStackParamList } from "@/app/types/navigation";
import { scale } from "@/app/utility/responsive";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const TRUE_CODE = "068456";

export default function JoinGroupScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [code, setCode] = useState("");
  const inputRef = useRef<TextInput>(null);

  const rawCode = code.replace(/[^0-9]/g, "");
  const isCorrect = rawCode === TRUE_CODE;
  const showErrorMessage = rawCode.length === 6 && !isCorrect;

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    });

    return () => task.cancel();
  }, []);

  const handleChangeText = (text: string) => {
    const raw = text.replace(/[^0-9]/g, "");

    let formatted = raw;
    if (raw.length > 3) {
      formatted = raw.slice(0, 3) + "-" + raw.slice(3, 6);
    } else {
      formatted = raw.slice(0, 6);
    }

    setCode(formatted);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.mainContainer}>
          <View style={styles.topSection}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <View
                style={{
                  width: scale.m(32),
                  height: scale.m(32),
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

          <View style={styles.middleSection}>
            <Text style={styles.codeText}>Join with code</Text>

            <View style={styles.inputContainer}>
              <View style={styles.iconWrapper}>
                <TextHash width={24} height={24} />
              </View>

              <TextInput
                ref={inputRef}
                style={styles.textInput}
                value={code}
                onChangeText={handleChangeText}
                keyboardType="number-pad"
                keyboardAppearance="dark"
                maxLength={7}
                caretHidden={false}
                autoCorrect={false}
              />
            </View>
            {showErrorMessage && (
              <View>
                <Text style={styles.wrongText}>Wrong code. Try again ?</Text>
              </View>
            )}
          </View>

          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: isCorrect
                    ? "rgba(255, 87, 25, 1)"
                    : "rgba(255, 87, 25, 0.32)",
                },
              ]}
            >
              <Text
                style={[
                  {
                    fontWeight: "700",
                    fontSize: scale.m(20),
                  },
                  {
                    color: isCorrect
                      ? "rgba(255, 255, 255, 1)"
                      : "rgba(255, 255, 255, 0.32)",
                  },
                ]}
              >
                Submit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: scale.m(20),
    paddingTop: scale.v(45),
  },
  topSection: {
    marginTop: scale.v(41),
    justifyContent: "center",
    alignItems: "flex-end",
  },
  codeText: {
    color: "rgba(255, 255, 255, 1)",
    fontFamily: "SN Pro",
    fontWeight: "700",
    fontSize: scale.m(20),
    lineHeight: scale.v(24),
    letterSpacing: scale.m(20) * -0.03,
    textAlign: "center",
  },
  middleSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: scale.v(24),
  },

  inputContainer: {
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    width: scale.m(343),
    height: scale.v(80),
    borderRadius: scale.m(16),
    position: "relative",
  },
  iconWrapper: {
    position: "absolute",
    left: scale.m(24),
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    width: "100%",
    height: "100%",
    color: "rgba(255, 255, 255, 1)",
    fontSize: scale.m(24),
    fontFamily: "SN Pro",
    fontWeight: "700",
    textAlign: "center",
  },

  bottomSection: {
    paddingVertical: scale.v(20),
    justifyContent: "flex-end",
  },
  submitButton: {
    width: "100%",
    height: scale.v(50),
    backgroundColor: "rgba(255, 87, 25, 0.32)",
    borderRadius: scale.m(42),
    justifyContent: "center",
    alignItems: "center",
  },
  wrongText: {
    color: "rgba(255, 50, 32, 1)",
    marginTop: scale.v(-12),
    fontFamily: "SN Pro",
    fontWeight: "700",
    fontSize: scale.m(15),
    lineHeight: scale.v(22),
    letterSpacing: scale.m(20) * -0.03,
    textAlign: "center",
  },
});
