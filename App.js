import AsyncStorage from "@react-native-async-storage/async-storage";
import AppNavigation from "./app/index";
const clearAuthStorage = async () => {
  try {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userData");
    console.log("AsyncStorage: Token and User Data successfully removed.");
  } catch (e) {
    console.error("AsyncStorage: Failed to remove items", e);
  }
};

export default function App() {
  // UNCOMMENT THIS useEffect block to run the clear function once on app load
  //   useEffect(() => {
  //     clearAuthStorage();
  //   }, []);
  return <AppNavigation />;
}
