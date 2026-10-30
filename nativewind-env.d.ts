/// <reference types="nativewind/types" />

// Metro/NativeWind handles the CSS entrypoint; TS just needs to know the
// side-effect import resolves to something.
declare module "*.css";
