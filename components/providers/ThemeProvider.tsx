'use client'

import { useThemeStore } from "@/store/ThemeStore"
import { useEffect } from "react"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeStore = useThemeStore(state => state.implementation);

  useEffect(() => {
    // Initialize theme on client side only
    const savedTheme = localStorage.getItem('theme-storage') 
      ? JSON.parse(localStorage.getItem('theme-storage')!).state.implementation.mode 
      : 'light';
    
    themeStore.setTheme(savedTheme);
  }, [themeStore]);

  return children;
}