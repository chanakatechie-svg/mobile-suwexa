import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import Toast from "react-native-toast-message";
import { useFonts } from "expo-font";
// Per-weight imports: the package root would bundle all 18 Inter files
// (~6 MB); the app uses these four.
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";

import "./global.css";

import RootNavigator from "./src/navigation/RootNavigator";
import { linking } from "./src/navigation/linking";
import { persistor, store } from "./src/store";
import { restoreToken } from "./src/store/features/patientAuthSlice";
import { loadToken } from "./src/store/storage/secureStorage";

function Splash() {
  return (
    <View className="flex-1 items-center justify-center bg-canvas">
      <ActivityIndicator size="large" color="#23824a" />
    </View>
  );
}

/**
 * Boot order matters.
 *
 * The token lives in expo-secure-store, but isAuthenticated is rehydrated from
 * AsyncStorage by redux-persist. Rendering the navigator before the token read
 * finishes means isAuthenticated can be briefly true while token is still null
 * — Dashboard mounts, fires fetchPatientProfile(null), 401s, and logs the user
 * out on EVERY cold start. So we gate rendering on the SecureStore read too,
 * and treat the token as the source of truth.
 */
function Boot() {
  const [ready, setReady] = useState(false);
  // Inter, the design's typeface. Held behind the splash so text never
  // renders first in the system font and then jumps.
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    (async () => {
      const token = await loadToken();
      store.dispatch(restoreToken(token));
      setReady(true);
    })();
  }, []);

  // A font that fails to load falls back to the system font rather than
  // leaving the patient on the splash screen.
  if (!ready || (!fontsLoaded && !fontError)) return <Splash />;

  return (
    <NavigationContainer linking={linking} fallback={<Splash />}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Splash />} persistor={persistor}>
        <SafeAreaProvider>
          <Boot />
          <StatusBar style="dark" />
          <Toast />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
