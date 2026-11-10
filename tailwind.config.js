/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Syne ships one file per weight, so each weight is its own family name.
      fontFamily: {
        // Display face (Figma: headlines, wordmark, section labels).
        orbitron: ["Orbitron_700Bold"],
        "orbitron-black": ["Orbitron_900Black"],
        syne: ["Syne_400Regular"],
        "syne-medium": ["Syne_500Medium"],
        "syne-semibold": ["Syne_600SemiBold"],
        "syne-bold": ["Syne_700Bold"],
        "syne-extrabold": ["Syne_800ExtraBold"],
      },
      colors: {
        background: {
          DEFAULT: "var(--background)",
          10: "#08060b1a", // 10% opacity
          20: "#08060b33", // 20% opacity
          40: "#08060b66", // 40% opacity
          60: "#08060b99", // 60% opacity
          80: "#08060bcc", // 80% opacity
          90: "#08060be6", // 90% opacity
        },
        foreground: "var(--foreground)",
        destructive: {
          DEFAULT: "var(--destructive)",
          10: "#ef44441a", // 10% opacity
          20: "#ef444433", // 20% opacity
          30: "#ef44444d", // 30% opacity
          40: "#ef444466", // 40% opacity
          50: "#ef444480", // 50% opacity
          60: "#ef444499", // 60% opacity
          70: "#ef4444b3", // 70% opacity
          80: "#ef4444cc", // 80% opacity
          90: "#ef4444e6", // 90% opacity
        },

        // --- CARD OPACITY STEPS ---
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
          10: "#110e161a",
          20: "#110e1633",
          40: "#110e1666",
          80: "#110e16cc",
        },

        // --- PRIMARY BRAND OPACITY STEPS ---
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          10: "#6d28d91a",
          20: "#6d28d933",
          40: "#6d28d966",
          80: "#6d28d9cc",
        },

        // --- SECONDARY SURFACE OPACITY STEPS ---
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          10: "#19171e1a",
          20: "#19171e33",
          40: "#19171e66",
          80: "#19171ecc",
        },

        // --- MUTED UTILITY OPACITY STEPS ---
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
          10: "#201e251a",
          20: "#201e2533",
          40: "#201e2566",
          80: "#201e25cc",
        },

        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
};