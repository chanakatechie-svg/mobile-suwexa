import * as Linking from "expo-linking";
import type { LinkingOptions } from "@react-navigation/native";

import type { RootStackParamList } from "./RootNavigator";

/**
 * Clinic login links carry ?clinic=<code>.
 *
 * React Navigation's linking handles BOTH entry paths — getInitialURL() for a
 * cold start and the "url" event for a warm one — and surfaces the value as a
 * route param, so screens don't have to branch on which happened.
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/"), "https://suwexa.app"],
  config: {
    screens: {
      Login: "patient-login",
      Dashboard: "patient-portal",
    },
  },
};
