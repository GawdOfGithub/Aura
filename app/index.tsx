import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useBackgroundUploadTrigger } from "./hooks/useBackgroundUploadTrigger";
import HomeScreen from "./screens/HomeScreen";
import ConsumptionScreen from "./screens/consumption";
import { useAppSelector } from "./store/hooks";
import LoginScreen from "./testApp/loginScreen";
import { VideoPreviewScreen } from "./testApp/videoPreviewScreen";

const Stack = createStackNavigator();

export default function AppNavigation() {
  const isAuthenticated = useAppSelector(
    (state) => state.user?.isAuthenticated,
  );

  useBackgroundUploadTrigger();

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      ) : (
        <GestureHandlerRootView>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home">
              {(props) => <HomeScreen {...props} initialIndex={0} />}
            </Stack.Screen>
            <Stack.Screen
              name="Consumption"
              component={ConsumptionScreen}
              //  options={videoToCircleTransition}
            />
            <Stack.Screen name="VideoPreview" component={VideoPreviewScreen} />
          </Stack.Navigator>
        </GestureHandlerRootView>
      )}
    </NavigationContainer>
  );
}
