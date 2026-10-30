import { combineReducers, configureStore } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  persistReducer,
  persistStore,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";

import patientAuth from "./features/patientAuthSlice";
import ui from "./features/uiSlice";
import { secureTokenMiddleware } from "./middleware/secureTokenMiddleware";

/**
 * NOTE the whitelist is the web list MINUS "token".
 * The token goes to expo-secure-store instead (see storage/secureStorage.ts):
 * a 24h bearer credential should not sit in plaintext AsyncStorage, and
 * SecureStore's ~2048-byte limit rules out storing `profile` alongside it.
 */
const patientAuthPersistConfig = {
  key: "patientAuth",
  storage: AsyncStorage,
  whitelist: ["patientId", "isAuthenticated", "profile"],
};

const uiPersistConfig = {
  key: "ui",
  storage: AsyncStorage,
  whitelist: ["lang"],
};

const rootReducer = combineReducers({
  patientAuth: persistReducer(patientAuthPersistConfig, patientAuth),
  ui: persistReducer(uiPersistConfig, ui),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist dispatches non-serializable action payloads.
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(secureTokenMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
