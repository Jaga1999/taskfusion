'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Keyboard } from "lucide-react"

const shortcuts = [
  {
    title: 'Quick Add Task',
    keys: ['Ctrl/⌘', 'Shift', 'A'],
    description: 'Open quick add task dialog'
  },
  {
    title: 'Toggle Timer',
    keys: ['Ctrl/⌘', 'Shift', 'T'],
    description: 'Start/stop task timer'
  },
  {
    title: 'Toggle Window',
    keys: ['Alt', 'Shift', 'T'],
    description: 'Show/hide application window'
  },
  {
    title: 'Export Tasks',
    keys: ['Ctrl/⌘', 'E'],
    description: 'Open export dialog'
  }
]

export function KeyboardShortcutsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Keyboard className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Keyboard shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.title}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{shortcut.title}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, index) => (
                    <>
                      <kbd
                        key={key}
                        className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
                      >
                        {key}
                      </kbd>
                      {index < shortcut.keys.length - 1 && (
                        <span className="text-muted-foreground">+</span>
                      )}
                    </>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {shortcut.description}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}