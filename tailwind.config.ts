import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        lg: "1280px",
      },
    },
    extend: {
      dropShadow: {
        "3d": ["0 20px 20px rgba(0, 0, 0, 0.3)"],
      },
    },
  },
  plugins: [],
} satisfies Config;
