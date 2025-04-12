'use client';
import { Button } from "@/components/ui/button";
const Header = () => {
    return (<header className="w-full h-16 px-6 flex items-center justify-between bg-white dark:bg-neutral-950 border-b">
      <h1 className="text-lg font-semibold">TaskFusion</h1>
      <div className="flex items-center gap-4">
        <Button variant="outline">Help</Button>
      </div>
    </header>);
};
export default Header;
