/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["\"Fraunces\"", "serif"],
        sans: ["\"Space Grotesk\"", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0f1115",
        haze: "#f4f1ea",
        ember: "#e76f51",
        tide: "#1b4965",
        grove: "#2a9d8f",
        gold: "#f4a261",
        mist: "#c7d6d5",
      },
      boxShadow: {
        soft: "0 20px 50px rgba(15, 17, 21, 0.15)",
      },
    },
  },
  plugins: [],
}
