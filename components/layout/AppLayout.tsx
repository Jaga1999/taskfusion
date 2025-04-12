'use client'

import { useEffect } from "react"
import Header from "./Header"
import { ExportDialog } from "../dialogs/ExportDialog"
import { useDialogStore } from "@/store/DialogStore"
import { useTimerStore } from "@/store/TimerStore"

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { exportDialogOpen, setExportDialogOpen } = useDialogStore();
  const { setupElectronListeners } = useTimerStore();

  useEffect(() => {
    // Set up IPC listeners
    if (typeof window !== 'undefined' && window.electron) {
      // Export dialog listener
      const cleanupExport = window.electron.onOpenExportDialog(() => {
        setExportDialogOpen(true);
      });

      // Set up timer listeners
      setupElectronListeners();

      return () => {
        cleanupExport();
      };
    }
  }, [setExportDialogOpen, setupElectronListeners]);

  return (
    <div className="flex h-screen w-screen">
      <main className="flex flex-col flex-1">
        <Header />
        <div className="p-6 overflow-y-auto">{children}</div>
      </main>

      <ExportDialog 
        open={exportDialogOpen} 
        onOpenChange={setExportDialogOpen} 
      />
    </div>
  )
}

export default AppLayout
