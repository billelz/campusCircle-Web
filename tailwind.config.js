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
        ink: "#0c1f33",
        haze: "#f2f7fb",
        ember: "#f47b66",
        tide: "#1d4b8f",
        grove: "#6bc3e6",
        gold: "#ffc2a3",
        mist: "#c7d9e7",
      },
      boxShadow: {
        soft: "0 20px 50px rgba(15, 17, 21, 0.15)",
      },
    },
  },
  plugins: [],
}
