# Suwexa Patient Portal — React Native (Expo) Mobile App

**Deliverable:** new `mobile-suwexa/` folder + this plan copied to `mobile-suwexa/PROJECT-PLAN.md`

---

## Context

The Suwexa clinic platform currently ships a web patient portal (`frontend-suwexa`,
React + Vite) with two screens: a 5-step SMS-OTP login/onboarding flow and a
read-only profile dashboard. Patients reach it via clinic-generated links like
`https://<domain>/patient-login?clinic=<code>`.

The user wants a native mobile app for that patient portal so patients can install
it rather than use a browser. The backend (`backend-suwexa`, NestJS) already
exposes everything needed — **no backend changes are required for V1.**

Confirmed decisions:
- **Expo managed workflow** (no bare RN CLI)
- **Standalone `mobile-suwexa/` folder** — copy + adapt from web, not a shared monorepo package
- **V1 scope: login + read-only dashboard parity** — no prescriptions list, no push notifications
- **NativeWind** for styling, so Tailwind class names and the brand palette carry over

---

## Corrections found by reading the source (act on these)

Three things differ from the obvious assumptions — all verified against the real code:

1. **`resolveClinic` is a PATH param, not a query param.**
   `backend-suwexa/src/clinic/clinic.controller.ts:26` is `@Get("resolve/:code")`, and
   `frontend-suwexa/src/services/api/auth.api.ts:18-21` calls
   `` `/clinics/resolve/${encodeURIComponent(code)}` ``. Real URL:
   `GET /api/v1/clinics/resolve/<code>`.

2. **`resolveClinic` currently lives on the staff `APIClient`.** `useClinicParam` imports
   `authApi`, which is backed by the staff axios instance (with refresh-token
   interceptors). On mobile, **move it onto the patient client** — it's a public
   endpoint, so this is behavior-preserving and avoids importing the whole staff client.

3. **The web `useCountdown` must NOT be ported as-is.**
   `frontend-suwexa/src/pages/patient-portal/login/index.tsx:114-138` decrements via
   `setInterval`. On mobile, JS timers are suspended when backgrounded, so a 5-minute
   OTP countdown can read 4:30 after 3 real minutes and the expiry guard never fires —
   the user hits an unexplained server 401 instead. Same root problem affects
   `tickOtpRetry` (`patientAuthSlice.ts:555-570`, verified: decrements by 1 per tick).
   Phase 3 replaces both with wall-clock deadlines.

Also worth knowing:
- Base URL **already includes the prefix**: `VITE_BASE_URL=http://localhost:5000/api/v1`.
  Keep `/api/v1` in `EXPO_PUBLIC_API_URL`.
- `main-green-*` are CSS variables (runtime per-clinic theming). V1 doesn't need that —
  resolve them to literal hex in the mobile Tailwind config. `wild-sand-*` /
  `athens-gray-*` are already hex; copy verbatim.
- The dashboard's `ProfileEditForm` is **dead code** (its Edit button is commented out),
  as is the prescriptions block. **Don't port either in V1** — porting the edit form
  would drag in `react-day-picker` + `date-fns` for a feature that doesn't ship.

---

## Backend surface (unchanged — reference only)

All under `/api/v1`, controller `patient-auth`:

| Route | Guard | Throttle |
|---|---|---|
| `GET /patient-auth/medical-catalog?type=&clinicId=` | public | 30/60s |
| `POST /patient-auth/check-phone` | public | 10/60s |
| `POST /patient-auth/otp/request` | public | 3/60s |
| `POST /patient-auth/otp/resend` | public | 3/60s |
| `POST /patient-auth/otp/verify` | public | 5/60s |
| `POST /patient-auth/select-account` | public (phoneToken in body) | 10/60s |
| `POST /patient-auth/profile/complete` | OnboardingGuard (Bearer) | — |
| `GET /patient-auth/profile/me` | PatientJwtGuard (Bearer) | — |
| `PUT /patient-auth/profile/me` | PatientJwtGuard | — |
| `GET /clinics/resolve/:code` | public | 20/60s |

**Three token types, no refresh endpoint exists:**
1. `phoneToken` — 300s, from `otp/verify` SELECT_ACCOUNT/SELECT_CLINIC, consumed by `select-account`. Not persisted.
2. onboarding token — 900s, `isAuthenticated:false`, only valid for `profile/complete`.
3. access token — 86400s (24h). After expiry the patient must redo the SMS OTP flow.

---

## Phase 0 — Scaffold and prove the toolchain

**Goal:** blank app boots on a real device with NativeWind rendering and the API reachable.

```bash
cd c:\Users\Chanaka\Desktop\Projects\suwexa
npx create-expo-app@latest mobile-suwexa --template blank-typescript
cd mobile-suwexa
```

Use `blank-typescript`, not the tabs template (which ships expo-router + a tabs layout
you'd delete immediately). V1 has two screens — React Navigation native-stack is the
smaller, more explicit fit.

**Dependencies** (use `npx expo install` for anything native — it pins to the SDK):

```bash
npx expo install @react-navigation/native @react-navigation/native-stack \
  react-native-screens react-native-safe-area-context
npx expo install expo-secure-store expo-linking expo-clipboard \
  @react-native-async-storage/async-storage react-native-svg
npm install nativewind react-native-reanimated
npm install --save-dev tailwindcss@3.4.17 prettier-plugin-tailwindcss
npm install @reduxjs/toolkit react-redux redux-persist axios react-hook-form
npm install @expo/vector-icons react-native-toast-message @gorhom/bottom-sheet
```

**Web → mobile dependency swaps:**

| Web | Mobile | Note |
|---|---|---|
| `react-icons/md`, `/im` | `@expo/vector-icons` (`MaterialIcons`) | same Material set |
| `react-hot-toast` | `react-native-toast-message` | imperative, closest API |
| `react-select` + creatable | hand-rolled `CreatableMultiSelect` on `@gorhom/bottom-sheet` | ~150 lines beats a bad dep |
| `react-day-picker` + `date-fns` | **nothing** | only used by the dead `ProfileEditForm`; login uses 3 dropdowns |
| `react-router-dom` | `@react-navigation/native` | |
| `react-helmet-async` (`PageMeta`) | dropped | no document head |
| shadcn `Input`/`Label`/`Button` | local `src/components/ui/*` | ~40-line RN wrappers |
| SVG logos | PNG `@2x`/`@3x` in `assets/images/` | avoids a Metro transformer that fights the NativeWind wrapper |

**Config:** `tailwind.config.js` with `presets: [require("nativewind/preset")]` and
content globs; `global.css` with the three `@tailwind` directives; `babel.config.js`
with `nativewind/babel` + `react-native-reanimated/plugin` (**must be last**);
`metro.config.js` with `withNativeWind(config, { input: "./global.css" })`;
`nativewind-env.d.ts` for `className` typing. Set `tsconfig` `paths: {"@/*": ["src/*"]}`.

### The localhost trap — verify this before writing any feature code

`import.meta.env.VITE_BASE_URL` → `process.env.EXPO_PUBLIC_API_URL`. Only the
`EXPO_PUBLIC_` prefix is exposed, and values are **inlined at build time** — editing
`.env` needs `npx expo start --clear`, not just a reload.

| Target | Host |
|---|---|
| iOS simulator | `http://localhost:5000/api/v1` |
| Android emulator | `http://10.0.2.2:5000/api/v1` |
| Physical device | `http://<LAN-IP>:5000/api/v1` (same Wi-Fi) |

Two more Android traps: **cleartext HTTP** is blocked on Android 9+ (fine in Expo Go;
a dev-client/release build over HTTP needs `expo-build-properties` with
`usesCleartextTraffic: true` — dev only), and **Windows Firewall** silently drops LAN
connections to port 5000 from a phone (if the emulator works but the device times out,
that's why). Commit `.env.example`, gitignore `.env`.

**Verify:** app opens in Expo Go on a real device; a `text-main-green-700` element
renders in brand green; a temporary `fetch(API_URL + "/clinics/resolve/<real-code>")`
returns 200 **from the physical device**. Do not proceed until that call succeeds.

---

## Phase 1 — Structure, API client, Redux store

**Goal:** store boots and rehydrates; one real network call succeeds from a screen.

```
mobile-suwexa/src/
├── navigation/     RootNavigator.tsx, navigationRef.ts, linking.ts, types.ts
├── screens/
│   ├── login/      LoginScreen.tsx + steps/{Phone,Otp,SelectAccount,SelectClinic,Profile}Step.tsx
│   └── dashboard/  DashboardScreen.tsx
├── store/          index.ts, hooks.ts, features/{patientAuthSlice,uiSlice}.ts,
│                   selectors/patientAuth.selectors.ts, storage/secureStorage.ts
├── services/       PatientClient.ts, api/patientAuth.api.ts
├── components/     ui/{Button,Input,Label,Card,Badge}.tsx
│                   common/{MaskedPhoneInput,OtpInput,DobDropdownInput,
│                           CreatableMultiSelect,PortalHeader}.tsx
├── hooks/          useWallClockCountdown.ts, useClinicParam.ts, usePortalLanguage.ts
├── i18n/index.ts   PORTAL_STRINGS (verbatim)
└── utils/          handleAuthFailure.ts, clinicLinks.ts, phone.ts, toast.ts
```

**Why split login into `steps/`:** the web version is one 1290-line component — already
at the edge of maintainable, and worse on mobile since each step needs its own
`KeyboardAvoidingView`/`ScrollView` handling. The orchestrator keeps the state machine
(`step`, `activePhone`, `otpDigits`, timers, all expiry effects); steps take props.

### Token storage — split by sensitivity

redux-persist's storage interface maps 1:1 onto SecureStore's async methods, but
**SecureStore has a ~2048-byte limit per value.** The web whitelist is
`["token","patientId","isAuthenticated","profile"]` (`frontend-suwexa/src/store/index.ts:54-58`),
and `profile` (with `medicalHistory[]`, `allergies[]`) can exceed that — putting the
whole slice in SecureStore is a latent, data-dependent crash.

- `patientAuth` → **AsyncStorage**, whitelist `["patientId","isAuthenticated","profile"]` (web's list **minus `token`**)
- **`token` alone → SecureStore**, outside redux-persist, via a small Redux middleware
  watching `setPatientLogin`, `setPatientOnboarding`, `selectAccount.fulfilled`,
  `completeProfile.fulfilled`, `patientLogout`
- On boot, read the token from SecureStore *before* rendering and dispatch `restoreToken`

**Desync rule:** `isAuthenticated` (AsyncStorage) and `token` (SecureStore) can desync
if the OS clears the keychain. **Treat `token` as source of truth** — boot must force
`isAuthenticated: false` when the SecureStore read returns null. Skipping this
reproduces exactly the redirect loop the web `handleAuthFailure` comment warns about.

### PatientClient

Port `frontend-suwexa/src/services/PatientClient.ts` (33 lines) nearly verbatim:
`baseURL: process.env.EXPO_PUBLIC_API_URL`; keep `PROTECTED_ENDPOINTS =
["/patient-auth/profile/me"]` and the 401-only-on-protected logic exactly (its comment
at lines 9-13 explains why login-flow 401s must propagate — preserve it); keep the
**no request interceptor** design, since an interceptor would happily attach an
*onboarding* token to a `profile/me` call.

**Add a 15s timeout** — the web client has none, survivable in a browser but on flaky
mobile data a request hangs forever and the spinner never clears.

`api/patientAuth.api.ts`: port all 9 wrappers verbatim, **plus** add
`resolveClinic: (code) => PatientClient.get(\`/clinics/resolve/${encodeURIComponent(code)}\`)`
per corrections 1 and 2.

### Slice + selectors

`patientAuthSlice.ts` — copy the 752-line web slice **verbatim**. It has zero web-specific
code (no `window`, no `localStorage`, no DOM); only the api import path changes. All 8
thunks, 8 reducers, 28 state fields, and the error shaping (429 → `retryAfterSeconds`,
401 → regex `/(\d+)\s+attempt/i` → `remainingAttempts`, 401 on profile → `{expired:true}`)
carry over untouched. **This is the highest-value verbatim copy in the project — resist
"improving" it.** Only two changes: add a `restoreToken` reducer, and rework
`tickOtpRetry` (Phase 3).

`patientAuth.selectors.ts` — all 31 selectors verbatim. Add typed
`useAppDispatch`/`useAppSelector` in `hooks.ts`.

**Verify:** `PersistGate` resolves; a debug `checkPhone("+9477…")` populates
`checkPhoneResult`; force-quit + relaunch preserves a seeded `profile`; a token written
to SecureStore reads back after relaunch.

---

## Phase 2 — Navigation, deep links, auth failure

**Goal:** two-screen shell with correct gating; `suwexa://patient-login?clinic=abc` resolves.

### Architecture decision: two stack screens, steps stay internal

**Recommended:** `Login` and `Dashboard` as stack screens selected conditionally by
`isAuthenticated`; the login's 5 steps stay internal `useState` — **not** stack screens.

Why:
- **The steps aren't navigable.** Every backward transition is a *reset*, not a "go back" —
  `resetToPhone()` (login/index.tsx:266-274) clears Redux onboarding state, phone, OTP
  digits, and both forms. Stack screens would give users a hardware Back button and
  swipe-back returning them to a step whose token is already consumed or expired.
- **The steps share dense live state** (`activePhone`, `otpDigits`, three countdowns,
  `clinicParam`, `phxOptions`) that would become route params or extra Redux state.
- **The expiry guards are cross-cutting** — five effects (lines 277-376) mostly call
  `resetToPhone()`; one orchestrator means one place owns "something expired → phone step."
- **It matches the port**, minimizing translation risk on the trickiest logic in the app.

`RootNavigator` mirrors `frontend-suwexa/src/router.tsx:228-242`: conditionally *render*
Dashboard vs Login rather than `navigate()`-ing, so React Navigation resets the stack
automatically on login/logout.

### handleAuthFailure → Redux dispatch

Port `frontend-suwexa/src/utils/handleAuthFailure.ts` with
`localStorage.removeItem(...)` → `SecureStore.deleteItemAsync` + `AsyncStorage.removeItem`,
and `window.location.href = ...` → `store.dispatch(patientLogout())`. Dispatching beats
navigating: with a conditional navigator, flipping `isAuthenticated` swaps the stack
automatically, and there's no URL to loop on.

**Import cycle warning:** `PatientClient` → `handleAuthFailure` → `store` → slice →
`patientAuth.api` → `PatientClient`. Break it with a lazy `require` inside the function
or a callback registered in `App.tsx`. Metro won't always error — it will hand you
`undefined` at runtime.

### Boot sequence (order matters)

1. `<Provider store>` → 2. `<PersistGate loading={<Splash/>}>` → 3. effect reading
SecureStore → dispatch `restoreToken` (or `patientLogout()` if null) → set `bootReady`
→ 4. render `<NavigationContainer ref linking>` only once `bootReady`.

Render the navigator before step 3 and `isAuthenticated` is briefly `true` from
AsyncStorage while `token` is still `null` — Dashboard mounts, fires
`fetchPatientProfile(null)`, 401s, and logs the user out on **every cold start**. This is
the most likely "works in dev, mysteriously logs out" bug in the project.

### Deep links

`app.json`: `"scheme": "suwexa"`. `linking.ts`: `prefixes: [Linking.createURL("/"),
"https://<web-domain>"]`, mapping `patient-login` with `clinic` as a param.

Port `useClinicParam.ts` (106 lines) replacing `useSearchParams()` with
`useRoute().params?.clinic`, falling back to `Linking.useURL()`/`parse()`.
**Cold-start vs warm-start is the gotcha:** a running app gets the link via the `url`
event, a killed app via `getInitialURL()`. React Navigation's `linking` prop handles both
and puts the value in route params — prefer route params, use `Linking` only as fallback,
and test both explicitly. Everything else copies verbatim: `isValidClinicCode`, the
resolve call, the three error cases (absent / malformed / unknown-or-inactive), `locked`.

From `utils/clinicLinks.ts` port only `isValidClinicCode` (`/^[a-z0-9-]{2,40}$/`) — the
link *builders* use `window.location.origin` and are staff-side.

**Verify:** seeding `isAuthenticated:true` swaps to Dashboard with no flash of Login;
`npx uri-scheme open "suwexa://patient-login?clinic=<code>" --android` (and `--ios`)
resolves the clinic name **both with the app killed and foregrounded**; malformed and
unknown codes show their respective messages with the phone field still usable.

---

## Phase 3 — Wall-clock countdowns (the subtle part)

**Goal:** timers that stay honest across backgrounding, Doze, and device sleep.

**The problem:** web `useCountdown` decrements on `setInterval(1000)`. iOS suspends JS
timers when backgrounded; Android throttles under Doze; sleep stops them entirely. A
300s countdown backgrounded for 4 real minutes may still show 04:10, so the
`phoneTokenRemaining === 0` / `onboardingRemaining === 0` guards (lines 328-345) never
fire and the user gets an opaque server 401 instead of "session expired."

**The fix — store a deadline, not a remaining count.** On activation set
`deadlineRef.current = Date.now() + seconds * 1000`; remaining is always *derived*
(`Math.max(0, Math.ceil((deadline - Date.now()) / 1000))`). Recompute on three triggers:
the 1s interval (now just a repaint prompt, accuracy irrelevant), an
`AppState` `"active"` listener (this is what makes backgrounding correct), and activation.

Keep the web hook's `{ remaining, formatted }` return shape so ported JSX
(`t.expiresIn(otpFmt)`, `t.selectWithin(phoneTokenFmt)`, `t.completeIn(onboardingFmt)`)
needs no edits. Signature: `useWallClockCountdown({ seconds, active, onExpire })`.

Details that matter:
- **`onExpire` must fire exactly once per activation** — guard with a `firedRef` reset on
  activation, or the interval and the AppState handler can both cross zero in the same
  frame → two `resetToPhone()` calls and two toasts.
- **Keep `onExpire` in a ref**, not in effect deps — the web passes inline closures, which
  in a dep array would restart the deadline every render.
- **Clear the interval at zero**; **don't re-seed the deadline on re-render** (that's the
  web bug — only set it on the `active` false→true edge).
- `Date.now()` can jump (clock change/NTP). For 5- and 15-minute windows that's fine and
  **matches server behavior**, which also validates against wall time. Don't reach for a
  monotonic clock.

Applies to all three countdowns (OTP 300s, phoneToken 300s, onboarding 900s), replacing
login/index.tsx:227-237.

**The rate-limit ticker** (`tickOtpRetry`) has the same root cause — verified at
`patientAuthSlice.ts:555-570`, it decrements by 1 per tick, so backgrounding 60s barely
moves it and Send stays disabled long after the server limit lapsed. Fix: store
`requestRetryAt = Date.now() + retryAfterSeconds * 1000` in the `rejected` cases, and
change `tickOtpRetry` to recompute from `Date.now()` instead of subtracting. Keep the
null-at-zero and error-clearing semantics — the Send/Resend `disabled` props depend on
them. Don't persist retry deadlines; the server enforces its own limit anyway.

**Verify:** on the OTP step, background 60 real seconds (stopwatch) → timer dropped ~60s,
not ~0-5s. Background 5+ minutes → "OTP expired" fires **once** and returns to phone.
Trigger a 429 (spam Send 4× in 60s), background 30s, foreground → counter moved ~30s.

---

## Phase 4 — Login screen (largest phase)

**Goal:** full 5-step flow end to end against the real backend on a device.

**Orchestrator** ports the logic half of the web login (lines 1-538): `step`,
`activePhone`, `otpDigits`, `pickingClinicForNew`, `manualEntry`, `linkBroken`;
the clinic-scoped catalog fetch effect (175-198) verbatim including `FALLBACK_PHX`/
`FALLBACK_ALLERGIES` (80-99) and the silent-catch-keeps-fallbacks behavior; all selectors
(200-225); three `useWallClockCountdown` calls; `resetToPhone` (266-274); all six effects
(277-376) verbatim except `toast.*` → the toast wrapper; all handlers (379-527);
`phoneHint` (530-538). `toE164` (106-109) → `utils/phone.ts` verbatim. The three
constants (300/900/300) mirror server TTLs — copy verbatim.

Layout: `SafeAreaView` + `KeyboardAvoidingView` (`behavior={Platform.OS === "ios" ?
"padding" : "height"}`) + `ScrollView keyboardShouldPersistTaps="handled"`.
**`keyboardShouldPersistTaps="handled"` is not optional** — without it, the first tap on
any button while the keyboard is open only dismisses the keyboard. Every "why do I have
to tap twice" bug traces here. Drop the `lg:` two-panel branding layout (544-570).

**PhoneStep:** `keyboardType="phone-pad"`, `maxLength={10}`, `autoComplete="tel"`.
Keep live `handleCheckPhone` on change (line 626) — it only fires once the value passes
`/^\+94[0-9]{9}$/`, so it's naturally guarded; add a 400ms debounce if it still trips the
10/60s throttle. react-hook-form works in RN but `register()` does not — use `<Controller>`
(`onChangeText` → `field.onChange`).

**OtpStep** — the fiddliest UI in the app:
- **Backspace on an empty box:** RN doesn't fire `onChangeText` when deleting from an
  already-empty `TextInput`, so the web `onKeyDown` approach (410-414) has no direct
  equivalent. Use `onKeyPress` checking `e.nativeEvent.key === "Backspace"`. Reliable on
  iOS; **inconsistent on Android across Gboard vs Samsung** — have a value-diff fallback
  and budget real device time.
- **Autofill:** `textContentType="oneTimeCode"` (iOS) + `autoComplete="sms-otp"` (Android).
  **Gotcha:** autofill can deliver all 6 digits as one `onChangeText` on box 0, so
  `handleOtpChange` must accept a multi-char value and spread it — the web's `/^\d?$/`
  single-char guard (line 402) would drop it. Also support `expo-clipboard` paste.
- Auto-submit at 6 digits (434-438) ports verbatim including the `!verifyLoading` guard.

**SelectAccountStep / SelectClinicStep:** straightforward; lists are tiny so a plain
`.map()` in the ScrollView avoids `FlatList`-inside-`ScrollView` warnings. Port
`handleCreateNewAccount` (471-479) and the auto-select effect (487-502) verbatim
**including `autoSelectedRef`** — it prevents a double-dispatch loop when the clinic is
unambiguous. Do not "simplify" that ref away.

**ProfileStep:** `DobDropdownInput` → three pickers, keeping the ISO `YYYY-MM-DD` output
contract (line 510 passes it straight through). `CreatableMultiSelect` replaces
`react-select/creatable`: multi-select from options, free-text creation, chips, and an
`Option[]` (`{label,value}`) value shape so `fromOptions` (101-102) works unchanged.
Payload builder (504-527) verbatim.

**i18n:** copy the 282-line `PORTAL_STRINGS` **verbatim** — pure data + functions, zero
web deps. **Sinhala caveat:** verify glyph shaping on a real low-end Android device;
bundle Noto Sans Sinhala via `expo-font` if it breaks. Add a toast wrapper exposing
`.success()`/`.error()` so the ~15 `toast.*` call sites port unedited.

**Verify** each path against the real backend on a physical device: new number →
COMPLETE_PROFILE; existing single account → LOGIN; 2+ accounts → SELECT_ACCOUNT;
no accounts + multiple clinics → SELECT_CLINIC; deep link auto-selects the clinic;
wrong OTP 3× decrements remaining-attempts then resets; OTP autofill from real SMS on
both platforms; backspace across all 6 boxes on a **real Android device**; airplane mode
mid-request surfaces a timeout and clears the spinner.

---

## Phase 5 — Language (sync → async)

`usePortalLanguage.ts:23` seeds `useState` **synchronously** from `localStorage` — which
RN has no equivalent for. It's also per-component state on web (login and dashboard each
hold a copy, agreeing only because both read the same key).

**Recommended: lift language into Redux.** Add a `uiSlice` with `{ lang: "en" | "si" }`
persisted to AsyncStorage (whitelist `["lang"]`). `usePortalLanguage()` keeps its exact
`{ lang, setLang, t }` signature but reads via `useAppSelector` — so **every ported call
site works unchanged**. The existing `PersistGate` already blocks render until
rehydration, so there's **no flash of English before Sinhala loads** and no loading state
to thread through components. Language also becomes genuinely shared, fixing the latent
web inconsistency for free.

(Context + `useEffect` + `loading` was rejected: same effort, but forces every consumer
to handle a loading state or accept an EN→SI flash on every cold start.)

**Verify:** toggle to සිං on Login → Dashboard still Sinhala → force-quit → relaunch
still Sinhala **with no visible English flash**; interpolated strings (`retryIn`,
`welcomeBack`) render in both languages.

---

## Phase 6 — Dashboard (read-only)

Port the **display path only** of `frontend-suwexa/src/pages/patient-portal/dashboard/index.tsx`:
header (logo, EN/සිං toggle, sign out, 387-432); profile card (avatar, name,
`patientCode`, phone, Verified badge); 6-cell detail grid (DOB, gender, weight, height,
email, address) — use flex with `width: "48%"`, since RN has no CSS Grid and NativeWind's
`grid-cols-2` doesn't translate; `medicalHistory`/`allergies` chips; loading skeletons
(437-444); `fetchPatientProfile` on mount with `expired` → `patientLogout` (340-361);
`handleLogout` → `dispatch(patientLogout())`, letting the conditional navigator and the
Phase 1 middleware handle the rest.

**Exclude** `ProfileEditForm` and the commented-out prescriptions block (both dead code).
`formatDate` (37-44) is still needed for the DOB cell.

**Add pull-to-refresh** (`RefreshControl` re-dispatching `fetchPatientProfile`) — the web
has no equivalent, but its absence reads as a bug on mobile, and it's ~5 lines.

**Verify:** correct name/code/masked phone/Verified badge; all 6 cells render with `-`
for nulls; chips render for both arrays and nothing for empty ones; sign out → Login and
relaunch **stays** on Login (proves SecureStore was actually cleared); a corrupted token
→ 401 → auto-logout with no crash and no redirect loop.

---

## Phase 7 — Hardening and build

- **24h expiry with no refresh route:** today expiry is discovered via a 401. Consider
  persisting the login timestamp and showing "your session has expired, please sign in
  again" on cold start past 24h — better than an error toast, one extra field.
- `app.json`: name, slug, `scheme`, icon, splash, `ios.bundleIdentifier`,
  `android.package`, and **trim default Android permissions** (an OTP app shouldn't
  request unexpected ones — note `RECEIVE_SMS` is **not** needed for autofill).
- `eas.json` with `development` / `preview` / `production` profiles.
  `EXPO_PUBLIC_API_URL` must be set **per profile** — it's baked in at build time, so a
  preview build pointed at localhost is a dead build.
- ESLint + Prettier + `prettier-plugin-tailwindcss` mirroring the web repo.
- `README.md` documenting the LAN-IP / `10.0.2.2` setup — the #1 onboarding friction.

**Verify:** `eas build --profile preview` produces installable artifacts for both
platforms hitting the staging API; full login → dashboard → sign out works on a
**release** build (Hermes release mode surfaces bugs dev mode hides).

---

## Risk register (ranked)

| # | Risk | Phase | Mitigation |
|---|---|---|---|
| 1 | Boot-order desync: `isAuthenticated` true while `token` null → logout every cold start | 2 | Gate render on both; token is source of truth |
| 2 | Android OTP backspace unreliable across keyboards | 4 | Test real Gboard + Samsung; value-diff fallback |
| 3 | Countdown `onExpire` double-firing | 3 | `firedRef` guard |
| 4 | SecureStore 2048-byte limit if `profile` stored there | 1 | Split: token→SecureStore, rest→AsyncStorage |
| 5 | Android emulator/device can't reach `localhost` | 0 | Host table; verify before any feature code |
| 6 | Import cycle `PatientClient` → `handleAuthFailure` → `store` | 2 | Lazy require or registered callback |
| 7 | OTP autofill sends 6 chars to one box; `/^\d?$/` drops them | 4 | Accept multi-char in `handleOtpChange` |
| 8 | Sinhala glyph shaping on low-end Android | 4 | Verify on device; bundle Noto Sans Sinhala |
| 9 | Keyboard covering inputs / tap-twice buttons | 4 | `KeyboardAvoidingView` + `keyboardShouldPersistTaps="handled"` |

## Effort sketch

| Phase | Effort |
|---|---|
| 0 Scaffold + connectivity | 0.5-1 day |
| 1 Structure, client, store | 1-1.5 days |
| 2 Navigation, deep links, boot | 1 day |
| 3 Wall-clock countdowns | 0.5-1 day |
| 4 Login (5 steps + custom inputs) | 3-4 days |
| 5 Language → Redux | 0.5 day |
| 6 Dashboard | 1 day |
| 7 Hardening, EAS, docs | 1 day |

Phase 4 dominates; within it `OtpInput` and `CreatableMultiSelect` are most likely to overrun.

---

## Key source files to port from

- `frontend-suwexa/src/pages/patient-portal/login/index.tsx` — 1290 lines, the whole 5-step machine (Phase 4)
- `frontend-suwexa/src/store/features/patientAuthSlice.ts` — 752 lines, copy verbatim except `tickOtpRetry`
- `frontend-suwexa/src/pages/patient-portal/dashboard/index.tsx` — display path only
- `frontend-suwexa/src/services/PatientClient.ts` + `services/api/patientAuth.api.ts`
- `frontend-suwexa/src/pages/patient-portal/i18n/index.ts` — verbatim
- `frontend-suwexa/src/hooks/useClinicParam.ts` + `src/utils/handleAuthFailure.ts` — the two most web-coupled files; both need real rewrites (Phase 2)

## First implementation step

Create `mobile-suwexa/` and copy this plan to `mobile-suwexa/PROJECT-PLAN.md` so it lives
with the code, then begin Phase 0.
