import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { themeConfig } from '../themes/theme.config';
class ThemeStoreImplementation {
    constructor(initialMode = 'light') {
        this.mode = initialMode;
        this.applyTheme(initialMode);
    }
    getMode() {
        return this.mode;
    }
    setTheme(mode) {
        this.mode = mode;
        this.applyTheme(mode);
    }
    toggleTheme() {
        const newMode = this.mode === 'light' ? 'dark' : 'light';
        this.setTheme(newMode);
    }
    applyTheme(mode) {
        // Ensure we are in the client-side environment before accessing `document`
        if (typeof document !== 'undefined') {
            const root = document.documentElement;
            const colors = themeConfig[mode];
            // Apply CSS variables
            Object.entries(colors).forEach(([key, value]) => {
                root.style.setProperty(`--${this.kebabCase(key)}`, value);
            });
            // Update HTML class for Tailwind
            if (mode === 'dark') {
                root.classList.add('dark');
            }
            else {
                root.classList.remove('dark');
            }
        }
    }
    kebabCase(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }
}
export const useThemeStore = create(persist((set) => ({
    implementation: new ThemeStoreImplementation()
}), {
    name: 'theme-storage',
    onRehydrateStorage: () => (state) => {
        if (state) {
            // Re-apply theme on page load
            const mode = state.implementation.getMode();
            state.implementation.setTheme(mode);
        }
    }
}));
