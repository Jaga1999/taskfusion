// tailwind.config.js
import forms from '@tailwindcss/forms';

export const content = [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@shadcn/ui/**/*.{js,ts,jsx,tsx}', // Add this line
];
export const theme = {
    extend: {},
};
export const plugins = [
    forms,
    // You can add more plugins if needed
];
  