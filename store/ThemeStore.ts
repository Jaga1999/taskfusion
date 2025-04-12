import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeMode, themeConfig } from '../themes/theme.config';

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

class ThemeStoreImplementation {
  private mode: ThemeMode;

  constructor(initialMode: ThemeMode = 'light') {
    this.mode = initialMode;
    this.applyTheme(initialMode);
  }

  public getMode(): ThemeMode {
    return this.mode;
  }

  public setTheme(mode: ThemeMode): void {
    this.mode = mode;
    this.applyTheme(mode);
  }

  public toggleTheme(): void {
    const newMode = this.mode === 'light' ? 'dark' : 'light';
    this.setTheme(newMode);
  }

  private applyTheme(mode: ThemeMode): void {
    const root = document.documentElement;
    const colors = themeConfig[mode];

    // Apply CSS variables
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${this.kebabCase(key)}`, value);
    });

    // Update HTML class for Tailwind
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }
}

export const useThemeStore = create(
  persist<{
    implementation: ThemeStoreImplementation;
  }>(
    (set) => ({
      implementation: new ThemeStoreImplementation()
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Re-apply theme on page load
          const mode = state.implementation.getMode();
          state.implementation.setTheme(mode);
        }
      }
    }
  )
);