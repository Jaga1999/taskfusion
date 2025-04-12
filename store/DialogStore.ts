import { create } from 'zustand';

interface DialogState {
  exportDialogOpen: boolean;
  setExportDialogOpen: (open: boolean) => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  exportDialogOpen: false,
  setExportDialogOpen: (open) => set({ exportDialogOpen: open })
}));