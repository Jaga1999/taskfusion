import { create } from 'zustand';
export const useDialogStore = create((set) => ({
    exportDialogOpen: false,
    setExportDialogOpen: (open) => set({ exportDialogOpen: open })
}));
