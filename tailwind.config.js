/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        abeezee: ["ABeeZee-Regular"],
        "abeezee-italic": ["ABeeZee-Italic"],
      },
    },
  },
  plugins: [],
};
