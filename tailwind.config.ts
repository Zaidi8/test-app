import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
        colors: {
          checkbox:'#34C759'
        }
    },
  },
  plugins: [],
};

export default config;
