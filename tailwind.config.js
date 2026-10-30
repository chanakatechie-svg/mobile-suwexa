/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Inter, as in the Figma design ("Suwexa · Patient App"). One family per
      // weight: on Android a fontWeight on a custom font is ignored, so the
      // weight has to be chosen by family name.
      fontFamily: {
        inter: ["Inter_400Regular"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
      },
      colors: {
        // Design tokens from the Figma file's color variables.
        canvas: "#f8fafc", // color/background
        surface: "#ffffff", // color/surface
        line: "#e2e8f0", // color/border
        ink: {
          DEFAULT: "#0f172a", // color/text
          muted: "#64748b", // color/text-muted
          subtle: "#94a3b8", // color/text-subtle
        },
        brand: "#4caf50", // color/brand (app icon)
        primary: {
          DEFAULT: "#23824a", // color/primary
          soft: "#e9f7ee", // color/primary-soft
          line: "#bfe6cc", // color/primary-border
        },
        warning: {
          DEFAULT: "#b45309", // color/warning
          soft: "#fff8eb", // color/warning-soft
          line: "#fbe0a9", // color/warning-border
        },
        danger: {
          DEFAULT: "#dc2626", // color/error
          soft: "#fef2f2", // color/error-soft
        },
        // Brand ramp. On web these are CSS variables (runtime per-clinic
        // theming); V1 mobile has no theming, so they're resolved to the
        // shipped literals from frontend-suwexa/tailwind.config.js.
        "main-green": {
          50: "#d9ffed",
          100: "#bdf5da",
          200: "#91eec2",
          300: "#7aebb6",
          400: "#22dd85",
          500: "#1dbf73",
          600: "#1aac68",
          700: "#17995c",
          800: "#148651",
          900: "#117345",
          950: "#0f603a",
        },
        "wild-sand": {
          50: "#F6F8FA",
          100: "#eaecef",
          200: "#d9dde2",
          300: "#c1c8cf",
          400: "#a2acb8",
          500: "#8c95a5",
          600: "#7a8396",
          700: "#6e7487",
          800: "#5c6171",
          900: "#4d505b",
          950: "#31333a",
        },
        "athens-gray": {
          50: "#f5f7f9",
          100: "#eceff3",
          200: "#d7dde6",
          300: "#bbc6d5",
          400: "#9baabf",
          500: "#8295af",
          600: "#7085a0",
          700: "#647791",
          800: "#556478",
          900: "#475261",
          950: "#2e343d",
        },
      },
    },
  },
  plugins: [],
};
