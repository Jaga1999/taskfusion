'use client'

import { Button } from "@/components/ui/button"
import { Sun, Moon, User, Calendar, List } from "lucide-react"
import { useThemeStore } from "@/store/ThemeStore"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { KeyboardShortcutsDialog } from "@/components/dialogs/KeyboardShortcutsDialog"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const Header = () => {
  const themeStore = useThemeStore(state => state.implementation)
  const isDark = themeStore.getMode() === 'dark'
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setName(localStorage.getItem('profile_name') || '')
      setAvatarUrl(localStorage.getItem('profile_avatar') || '')
    }
  }, [])

  return (
    <header className="w-full h-16 px-6 flex items-center justify-between bg-white dark:bg-neutral-950 border-b">
      <div className="flex items-center gap-8">
        <h1 className="text-lg font-semibold">TaskFusion</h1>
        <nav className="flex items-center gap-2">
          <Link href="/tasks">
            <Button 
              variant={pathname === '/tasks' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Tasks
            </Button>
          </Link>
          <Link href="/timeline">
            <Button 
              variant={pathname === '/timeline' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Timeline
            </Button>
          </Link>
        </nav>
      </div>
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
        <KeyboardShortcutsDialog />
        <Link href="/profile">
          {avatarUrl ? (
            <Avatar className="cursor-pointer">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <Button 
              variant={pathname === '/profile' ? 'default' : 'ghost'} 
              size="icon"
            >
              <User className="h-5 w-5" />
            </Button>
          )}
        </Link>
      </div>
    </header>
  )
}

export default Header
