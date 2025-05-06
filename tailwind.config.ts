import type { Config } from 'tailwindcss';

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
  plugins: [],
};

export default config;
