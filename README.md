# Suwexa Patient — Mobile App

React Native (Expo managed) app for the Suwexa **patient portal**. It ports the web
patient portal from `../frontend-suwexa` — the SMS-OTP login/onboarding flow and the
profile dashboard — and talks to the same NestJS backend in `../backend-suwexa`.

The staff dashboard is **not** part of this app.

See [PROJECT-PLAN.md](./PROJECT-PLAN.md) for the full phased implementation plan,
architecture decisions, and risk register.

## Requirements

- Node 20+
- The Suwexa backend running locally on port 5000
- Expo Go on a physical device, or an Android emulator / iOS simulator

## Getting started

```bash
npm install
cp .env.example .env      # then edit the host — see below
npx expo start
```

Scan the QR with Expo Go, or press `a` / `i` for emulator / simulator.

## Configuring the API URL (read this first)

`EXPO_PUBLIC_API_URL` in `.env` must point at a host **the device itself can reach**.
This is the single most common setup blocker.

| Running on | Use |
|---|---|
| iOS simulator | `http://localhost:5000/api/v1` |
| Android emulator | `http://10.0.2.2:5000/api/v1` — `localhost` means the emulator |
| Physical device | `http://<YOUR-LAN-IP>:5000/api/v1` — phone on the same Wi-Fi |

Find your LAN IP with `ipconfig` (Windows) / `ifconfig` (macOS/Linux), or read it off
the `exp://…` URL that `expo start` prints.

Two things that bite:

- **Env values are inlined at build time.** After editing `.env`, restart with
  `npx expo start --clear`. A fast refresh will not pick it up.
- **Windows Firewall** silently drops LAN connections to port 5000 from a phone. If the
  emulator works but your device times out, allow Node through the *private* network
  profile.

The `/api/v1` suffix is required — the backend sets that global prefix.

Also note Android 9+ blocks cleartext HTTP. Expo Go permits it in development; a
dev-client or release build over plain HTTP would need `expo-build-properties` with
`usesCleartextTraffic: true`. Production is HTTPS, so this is a dev-only concern.

## Verifying the setup

The current `App.tsx` is a temporary Phase 0 verification screen (it gets replaced by
the real navigator in Phase 2). It checks the three things that must work before any
feature code matters:

1. **NativeWind renders** — the brand-green swatches show actual green, not grey.
2. **Env var is inlined** — the API URL is displayed on screen.
3. **Backend is reachable from the device** — tap *Test connection*. A **404 is a pass**
   (the server answered); only a network error is a real failure.

Do not move on to feature work until the connection test succeeds on the device you
intend to develop against.

## Scripts

| Command | What it does |
|---|---|
| `npx expo start` | Start the dev server |
| `npx expo start --clear` | Start with a cleared cache — needed after `.env` edits |
| `npx tsc --noEmit` | Typecheck |
| `npx expo export --platform android` | Production bundle build (catches Metro/Babel issues typecheck can't) |

## Stack

| Concern | Choice |
|---|---|
| Toolchain | Expo SDK 57 (managed), React 19, RN 0.86 |
| Styling | NativeWind 4 (Tailwind class names, brand palette ported from web) |
| Navigation | React Navigation native-stack |
| State | Redux Toolkit + redux-persist (slice copied near-verbatim from web) |
| Secrets | `expo-secure-store` for the patient JWT; AsyncStorage for the rest |
| HTTP | axios (`PatientClient`, separate from the web's staff client) |
| Forms | react-hook-form (`<Controller>` — `register()` does not work in RN) |

## Project layout

```
src/
├── navigation/   RootNavigator, navigationRef, deep-link config
├── screens/      login/ (orchestrator + 5 steps), dashboard/
├── store/        slice, selectors, persist + SecureStore split
├── services/     PatientClient, api wrappers
├── components/   ui/ primitives, common/ (phone, OTP, DOB, multiselect)
├── hooks/        useWallClockCountdown, useClinicParam, usePortalLanguage
├── i18n/         PORTAL_STRINGS (EN / Sinhala)
└── utils/
```

## Deep links

Clinic login links carry a `?clinic=<code>` param. Test with:

```bash
npx uri-scheme open "suwexa://patient-login?clinic=<code>" --android
npx uri-scheme open "suwexa://patient-login?clinic=<code>" --ios
```

Test **both** with the app killed and with it foregrounded — they take different code
paths (`getInitialURL()` vs the `url` event).
"# mobile-suwexa" 
