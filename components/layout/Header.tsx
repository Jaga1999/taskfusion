'use client'

import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import { useThemeStore } from "@/store/ThemeStore"

const Header = () => {
  const themeStore = useThemeStore(state => state.implementation);
  const isDark = themeStore.getMode() === 'dark';

  return (
    <header className="w-full h-16 px-6 flex items-center justify-between bg-white dark:bg-neutral-950 border-b">
      <h1 className="text-lg font-semibold">TaskFusion</h1>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => themeStore.toggleTheme()}
          title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" />
          )}
        </Button>
        <Button variant="outline">Help</Button>
      </div>
    </header>
  )
}

export default Header
