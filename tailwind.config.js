/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      sm: "600px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      backgroundImage: {
        login: "url('/public/loginBackground.png')",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-none": {
          "scrollbar-width": "none" /* Firefox */,
        },
      };

      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
  corePlugins: {
    preflight: false,
  },
  important: "#app",
};
