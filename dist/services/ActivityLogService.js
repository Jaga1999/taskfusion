import { create } from 'zustand';
export class ActivityLogService {
    constructor() {
        this.commands = [];
        this.currentIndex = -1;
    }
    static getInstance() {
        if (!ActivityLogService.instance) {
            ActivityLogService.instance = new ActivityLogService();
        }
        return ActivityLogService.instance;
    }
    async executeCommand(command) {
        // Remove any commands after current index (in case we're redoing after undoing)
        if (this.currentIndex < this.commands.length - 1) {
            this.commands = this.commands.slice(0, this.currentIndex + 1);
        }
        // Execute command and add to history
        await command.execute();
        this.commands.push(command);
        this.currentIndex++;
    }
    async undo() {
        if (!this.canUndo())
            return;
        const command = this.commands[this.currentIndex];
        await command.undo();
        this.currentIndex--;
    }
    async redo() {
        if (!this.canRedo())
            return;
        const command = this.commands[this.currentIndex + 1];
        await command.redo();
        this.currentIndex++;
    }
    canUndo() {
        return this.currentIndex >= 0;
    }
    canRedo() {
        return this.currentIndex < this.commands.length - 1;
    }
    getHistory() {
        return [...this.commands];
    }
    getCurrentIndex() {
        return this.currentIndex;
    }
    clear() {
        this.commands = [];
        this.currentIndex = -1;
    }
}
export const useActivityLogStore = create((set) => {
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
