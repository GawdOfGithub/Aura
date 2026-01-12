import { ActivityIndicator } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AppNavigation from "./app/index";
import { mmkvStorage } from "./app/storage/mmkvStorage";
import { persistor, store } from "./app/store";

const clearAuthStorage = () => {
  try {
    mmkvStorage.remove("userToken");
    mmkvStorage.remove("userData");
    console.log("MMKV: Token and User Data successfully removed.");
  } catch (e) {
    console.error("MMKV: Failed to remove items", e);
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




