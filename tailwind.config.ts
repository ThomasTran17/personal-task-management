const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: "#A3E635",
        secondary: "#818CF8",
        bg: "#FDE68A",
        dark: "#1A1A1A",
      },
      boxShadow: {
        neubru: "4px 4px 0px 0px rgba(0,0,0,1)",
        neubruHover: "2px 2px 0px 0px rgba(0,0,0,1)",
        neubruLg: "8px 8px 0px 0px rgba(0,0,0,1)",
      },
      borderWidth: {
        neubru: "3px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
