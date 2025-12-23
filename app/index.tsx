import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { useAppSelector } from "./store/hooks";
import { VideoStorageProvider } from "./testApp/contexts";
import HomeScreen from "./testApp/homeScreen";
import LoginScreen from "./testApp/loginScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  const { isAuthenticated } = useAppSelector((state) => state.user);

  // --- LOADING VIEW ---

  // --- NAVIGATION STRUCTURE ---
  return (
    <VideoStorageProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name='Login' component={LoginScreen} />
          ) : (
            // LOGGED IN
            <Stack.Screen name='Home' component={HomeScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </VideoStorageProvider>
  );
}
