'use client';
import { Button } from "@/components/ui/button";
import { Sun, Moon, User } from "lucide-react";
import { useThemeStore } from "@/store/ThemeStore";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import Link from "next/link";
const Header = () => {
    const themeStore = useThemeStore(state => state.implementation);
    const isDark = themeStore.getMode() === 'dark';
    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setName(localStorage.getItem('profile_name') || '');
            setAvatarUrl(localStorage.getItem('profile_avatar') || '');
        }
    }, []);
    return (<header className="w-full h-16 px-6 flex items-center justify-between bg-white dark:bg-neutral-950 border-b">
      <h1 className="text-lg font-semibold">TaskFusion</h1>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => themeStore.toggleTheme()} title={`Switch to ${isDark ? 'light' : 'dark'} theme`}>
          {isDark ? (<Sun className="h-5 w-5 text-yellow-500"/>) : (<Moon className="h-5 w-5 text-slate-700"/>)}
        </Button>
        <Button variant="outline">Help</Button>
        <Link href="/profile">
          {avatarUrl ? (<Avatar className="cursor-pointer">
              <AvatarImage src={avatarUrl} alt={name}/>
              <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>) : (<Button variant="ghost" size="icon">
              <User className="h-5 w-5"/>
            </Button>)}
        </Link>
      </div>
    </header>);
};
export default Header;
