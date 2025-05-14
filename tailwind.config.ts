import type { Config } from 'tailwindcss';
import scrollbar from 'tailwind-scrollbar'
const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
        colors: {
          checkbox:'#34C759',
          bg:'#ffffff',
        }
    },
  },
  plugins: [scrollbar],
};

export default config;
