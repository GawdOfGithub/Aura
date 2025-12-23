import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AppNavigation from "./app/index";
import { persistor, store } from "./app/store";

const clearAuthStorage = async () => {
  try {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userData");
    console.log("AsyncStorage: Token and User Data successfully removed.");
  } catch (e) {
    console.error("AsyncStorage: Failed to remove items", e);
  }
};

const App = () => {
  // UNCOMMENT THIS useEffect block to run the clear function once on app load
  //   useEffect(() => {
  //     clearAuthStorage();
  //   }, []);
  return (
    <Provider store={store}>
      <PersistGate
        loading={<ActivityIndicator size='large' />}
        persistor={persistor}>
        <AppNavigation />
      </PersistGate>
    </Provider>
  );
};

export default App;
