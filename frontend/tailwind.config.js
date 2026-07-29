/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f5ff",
          100: "#dbe7ff",
          500: "#2952e3",
          600: "#1f41c4",
          700: "#1a359e",
        },
        ink: {
          950: "#0E1A2E",
          900: "#12203A",
          800: "#1E3350",
          700: "#2B4568",
        },
        paper: {
          50: "#F5F4EE",
          100: "#ECEAE1",
          200: "#DDDACC",
        },
        stamp: {
          amber: "#B9791E",
          green: "#2F6B45",
        },
        line: "#CBC7BB",
      },
      fontFamily: {
        display: ["Oswald", "sans-serif"],
        body: ["Inter", "sans-serif"],
        data: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
