import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { createContext, useEffect, useMemo, useReducer } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { VideoStorageProvider } from "./testApp/contexts";
import HomeScreen from "./testApp/homeScreen";
import LoginScreen from "./testApp/loginScreen";

interface UserData {
  name: string;
  phone_no: string;
  profile_photo: string;
}
interface AuthContextType {
  signIn: (token: any, user: UserData) => void;
  signOut: () => void;
  userToken: string | null;
  userData: UserData | null;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  signIn: (token, user) => {},
  signOut: () => {},
  userToken: null,
  userData: null,
  isLoading: false,
});
const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case "RESTORE_TOKEN":
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
            userData: action.user,
          };
        case "SIGN_IN":
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
            userData: action.user,
          };
        case "SIGN_OUT":
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            userData: null,
          };
        default:
          return prevState;
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      userData: null,
    }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      let userData;
      try {
        userToken = await AsyncStorage.getItem("userToken");
        const jsonUser = await AsyncStorage.getItem("userData");
        userData = jsonUser != null ? JSON.parse(jsonUser) : null;
      } catch (e) {
        console.warn("Restoring token failed", e);
      }
      dispatch({ type: "RESTORE_TOKEN", token: userToken, user: userData });
    };

    bootstrapAsync();
  }, []);

  const authContext = useMemo(
    () => ({
      signIn: async (token: any, user: any) => {
        await AsyncStorage.setItem("userToken", token);
        if (user) {
          await AsyncStorage.setItem("userData", JSON.stringify(user));
        }
        dispatch({ type: "SIGN_IN", token: token, user: user });
      },
      signOut: async () => {
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("userData");
        dispatch({ type: "SIGN_OUT" });
      },
    }),
    []
  );

  // --- LOADING VIEW ---
  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#FFD700' />
      </View>
    );
  }

  // --- NAVIGATION STRUCTURE ---
  return (
    <AuthContext.Provider
      value={{
        ...authContext,

        userToken: state.userToken,
        userData: state.userData,
        isLoading: state.isLoading,
      }}>
      <VideoStorageProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {state.userToken == null ? (
              // NOT LOGGED IN
              <Stack.Screen
                name='Login'
                options={{
                  animationTypeForReplace: state.isSignout ? "pop" : "push",
                }}>
                {/* Pass authContext.signIn as a prop to avoid circular imports */}
                {(props) => (
                  <LoginScreen
                    {...props}
                    onLogin={(token: any, user: any) =>
                      authContext.signIn(token, user)
                    }
                  />
                )}
              </Stack.Screen>
            ) : (
              // LOGGED IN
              <Stack.Screen name='Home' component={HomeScreen} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </VideoStorageProvider>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
