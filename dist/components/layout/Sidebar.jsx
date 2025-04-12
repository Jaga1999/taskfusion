'use client';
import { Button } from "@/components/ui/button";
import Link from "next/link";
const Sidebar = () => {
    return (<aside className="h-full w-64 bg-neutral-100 dark:bg-neutral-900 border-r px-4 py-6">
      <nav className="flex flex-col gap-4">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
        </Link>
        <Link href="/tasks">
          <Button variant="ghost" className="w-full justify-start">Tasks</Button>
        </Link>
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start">Settings</Button>
        </Link>
      </nav>
    </aside>);
};
export default Sidebar;
