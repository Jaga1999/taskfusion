import { create } from 'zustand';

interface LoadingState {
  loadingActions: Set<string>;
  setLoading: (action: string, isLoading: boolean) => void;
  isLoading: (action: string) => boolean;
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  loadingActions: new Set(),

  setLoading: (action: string, isLoading: boolean) => {
    set(state => {
      const newLoadingActions = new Set(state.loadingActions);
      if (isLoading) {
        newLoadingActions.add(action);
      } else {
        newLoadingActions.delete(action);
      }
      return { loadingActions: newLoadingActions };
    });
  },

  isLoading: (action: string) => {
    return get().loadingActions.has(action);
  }
}));