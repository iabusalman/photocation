/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Cairo"', "system-ui", "sans-serif"],
        display: ['"Cairo"', "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eff5ff",
          100: "#dbe8fe",
          200: "#bfd6fe",
          300: "#93bbfd",
          400: "#609afa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
        },
        accent: {
          violet: "#7c3aed",
          cyan: "#06b6d4",
          pink: "#ec4899",
          amber: "#f59e0b",
          green: "#16a34a",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16,24,40,0.05), 0 12px 28px -14px rgba(16,24,40,0.18)",
        lift: "0 2px 4px rgba(16,24,40,0.05), 0 24px 48px -20px rgba(16,24,40,0.28)",
        glow: "0 10px 26px -8px rgba(37,99,235,0.45)",
        ring: "0 0 0 1px rgba(16,24,40,0.06)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "spin-slow": "spin-slow 28s linear infinite",
      },
    },
  },
  plugins: [],
};
