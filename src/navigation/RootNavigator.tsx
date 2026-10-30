import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/login/LoginScreen";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import { useAppSelector } from "../store/hooks";

export type RootStackParamList = {
  Login: { clinic?: string } | undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Mirrors the web router's patient gate (frontend-suwexa/src/router.tsx):
 * conditionally RENDER the screen rather than navigate() to it, so React
 * Navigation resets the stack automatically on login/logout and there is no
 * way to back-navigate into a dead session.
 */
export default function RootNavigator() {
  const isAuthenticated = useAppSelector((s) => s.patientAuth.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
