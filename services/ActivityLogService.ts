import { Command } from '../models/Command';
import { create } from 'zustand';

export class ActivityLogService {
  private static instance: ActivityLogService;
  private commands: Command[] = [];
  private currentIndex: number = -1;

  private constructor() {}

  public static getInstance(): ActivityLogService {
    if (!ActivityLogService.instance) {
      ActivityLogService.instance = new ActivityLogService();
    }
    return ActivityLogService.instance;
  }

  public async executeCommand(command: Command): Promise<void> {
    // Remove any commands after current index (in case we're redoing after undoing)
    if (this.currentIndex < this.commands.length - 1) {
      this.commands = this.commands.slice(0, this.currentIndex + 1);
    }

    // Execute command and add to history
    await command.execute();
    this.commands.push(command);
    this.currentIndex++;
  }

  public async undo(): Promise<void> {
    if (!this.canUndo()) return;

    const command = this.commands[this.currentIndex];
    await command.undo();
    this.currentIndex--;
  }

  public async redo(): Promise<void> {
    if (!this.canRedo()) return;

    const command = this.commands[this.currentIndex + 1];
    await command.redo();
    this.currentIndex++;
  }

  public canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  public canRedo(): boolean {
    return this.currentIndex < this.commands.length - 1;
  }

  public getHistory(): Command[] {
    return [...this.commands];
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public clear(): void {
    this.commands = [];
    this.currentIndex = -1;
  }
}

// Create Zustand store for ActivityLog state
interface ActivityLogState {
  canUndo: boolean;
  canRedo: boolean;
  history: Command[];
  currentIndex: number;
}

export const useActivityLogStore = create<ActivityLogState>((set) => {
  const service = ActivityLogService.getInstance();
  
  return {
    canUndo: service.canUndo(),
    canRedo: service.canRedo(),
    history: service.getHistory(),
    currentIndex: service.getCurrentIndex(),
    
    // Update state after each operation
    updateState: () => set({
      canUndo: service.canUndo(),
      canRedo: service.canRedo(),
      history: service.getHistory(),
      currentIndex: service.getCurrentIndex()
    })
  };
});