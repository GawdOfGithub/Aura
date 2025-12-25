import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { useAppSelector } from "./store/hooks";
import { VideoStorageProvider } from "./testApp/contexts";
import HomeScreen from "./testApp/homeScreen";
import LoginScreen from "./testApp/loginScreen";
import { VideoPreviewScreen } from "./testApp/videoPreviewScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  const { isAuthenticated } = useAppSelector((state) => state.user);

  // --- LOADING VIEW ---

  // --- NAVIGATION STRUCTURE ---
  return (
    <VideoStorageProvider>
      <NavigationContainer>
        {!isAuthenticated ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name='Login' component={LoginScreen} />
          </Stack.Navigator>
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name='Home' component={HomeScreen} />
            <Stack.Screen name='VideoPreview' component={VideoPreviewScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </VideoStorageProvider>
  );
}
