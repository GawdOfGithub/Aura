import { RootStackParamList } from "@/app/types/navigation";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import CreateGroupScreen from "./CreateGroupScreen";
import GroupNameScreen from "./GroupNameScreen";

export default function CreateGroupFlow() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [step, setStep] = useState<"select-users" | "group-name">(
    "select-users",
  );
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

  const handleNext = (users: any[]) => {
    setSelectedUsers(users);
    setStep("group-name");
  };

  const handleBack = () => {
    setStep("select-users");
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (step === "select-users") {
    return (
      <CreateGroupScreen
        onNext={handleNext}
        onClose={handleClose}
        initialSelectedIds={selectedUsers.map((u) => u.id)}
      />
    );
  }

  return (
    <GroupNameScreen
      users={selectedUsers}
      onBack={handleBack}
      onClose={handleClose}
    />
  );
}