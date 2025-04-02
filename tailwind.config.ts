import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#000000',
        'dark-background': '#1a1a1a',
        'dark-foreground': '#ffffff',
      },
    },
  },
  plugins: [],
};

export default config; 