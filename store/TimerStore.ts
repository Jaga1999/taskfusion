import { create } from 'zustand';
import { Timer, TimerState } from '../models/Timer';

interface TimerStore {
  timer: Timer;
  currentTaskId?: string;
  sessionHistory: Array<{
    taskId?: string;
    startTime: Date;
    endTime: Date;
    completed: boolean;
  }>;
  startTimer: (taskId?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  getFormattedTime: () => string;
  setupElectronListeners: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => {
  const timer = new Timer();
  
  return {
    timer,
    sessionHistory: [],

    startTimer: (taskId?: string) => {
      const startTime = new Date();
      
      timer.start(
        taskId,
        // Update on every tick to trigger re-render
        () => set({}),
        // On complete
        () => {
          const sessionRecord = {
            taskId: timer.getTaskId(),
            startTime,
            endTime: new Date(),
            completed: true
          };
          
          set(state => ({
            sessionHistory: [...state.sessionHistory, sessionRecord]
          }));
        }
      );
      
      set({ currentTaskId: taskId });
    },

    pauseTimer: () => {
      timer.pause();
      set({}); // Trigger re-render
    },

    resumeTimer: () => {
      timer.resume();
      set({}); // Trigger re-render
    },

    resetTimer: () => {
      if (timer.getState() !== TimerState.IDLE) {
        const sessionRecord = {
          taskId: timer.getTaskId(),
          startTime: new Date(),
          endTime: new Date(),
          completed: false
        };
        
        set(state => ({
          sessionHistory: [...state.sessionHistory, sessionRecord]
        }));
      }
      
      timer.reset();
      set({ currentTaskId: undefined });
    },

    getFormattedTime: () => {
      return Timer.formatTime(timer.getRemainingTime());
    },

    setupElectronListeners: () => {
      if (typeof window !== 'undefined' && window.electron) {
        // Handle start timer from tray
        window.electron.onStartTimer(() => {
          const { timer } = get();
          if (timer.getState() === TimerState.IDLE) {
            get().startTimer();
          }
        });

        // Handle toggle timer from global shortcut
        window.electron.onToggleTimer(() => {
          const { timer } = get();
          switch (timer.getState()) {
            case TimerState.IDLE:
              get().startTimer();
              break;
            case TimerState.RUNNING:
              get().pauseTimer();
              break;
            case TimerState.PAUSED:
              get().resumeTimer();
              break;
          }
        });
      }
    }
  };
});