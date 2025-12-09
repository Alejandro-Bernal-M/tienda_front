import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mokaze: {
          base: '#F5F5F0',       // Blanco Hueso / Niebla (Fondo)
          dark: '#1C1C1E',       // Piedra Volcánica (Texto)
          primary: '#2C3E30',    // Verde Musgo Profundo (Marca)
          accent: '#C75D35',     // Terracota / Aventura (Botones)
          sand: '#E3E0D6',       // Arena (Detalles)
          mist: '#D4D4D8',       // Gris niebla
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;