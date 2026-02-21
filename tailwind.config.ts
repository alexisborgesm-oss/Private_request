import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#ffffff",
        sidebar: "#f5f5f5",
        border: "#e7e7e7",
        ink: "#111827",
        accent: "#2bb6c0",
        accentSoft: "#e9fbfc"
      },
      boxShadow: { soft: "0 1px 2px rgba(0,0,0,0.04)" }
    }
  },
  plugins: []
} satisfies Config;
