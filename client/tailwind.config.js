export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        syne:  ["Syne", "sans-serif"],
        dm:    ["DM Sans", "sans-serif"],
        mono:  ["Space Mono", "monospace"],
      },
      colors: {
        green:  { DEFAULT: "#00A651", dark: "#007A3D", dim: "#E6F5EC" },
        red:    { DEFAULT: "#CE1126" },
        yellow: { DEFAULT: "#FCD116" },
        ink:    { DEFAULT: "#0F1117", 2: "#1E2029", 3: "#2C2F3A" },
      },
    },
  },
  plugins: [],
};
