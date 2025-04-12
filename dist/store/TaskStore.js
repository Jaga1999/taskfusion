import { create } from 'zustand';
import { Task, TaskPriority } from '../models/Task';
class TaskStoreImplementation {
    constructor() {
        this.state = {
            tasks: [],
            selectedTaskId: null,
            filter: {}
        };
    }
    // Task CRUD operations
    addTask(taskData) {
        const task = new Task(taskData);
        this.state.tasks.push(task);
        return task;
    }
    updateTask(taskId, updates) {
        const task = this.getTaskById(taskId);
        if (!task)
            return null;
        if (updates.title)
            task.setTitle(updates.title);
        if (updates.description)
            task.setDescription(updates.description);
        if (updates.priority)
            task.setPriority(updates.priority);
        if (updates.status)
            task.setStatus(updates.status);
        if (updates.tags)
            task.setTags(updates.tags);
        if (updates.estimatedTime)
            task.setEstimatedTime(updates.estimatedTime);
        if (updates.actualTime)
            task.setActualTime(updates.actualTime);
        return task;
    }
    deleteTask(taskId) {
        const index = this.state.tasks.findIndex(task => task.getId() === taskId);
        if (index === -1)
            return false;
        this.state.tasks.splice(index, 1);
        if (this.state.selectedTaskId === taskId) {
            this.state.selectedTaskId = null;
        }
        return true;
    }
    getTaskById(taskId) {
        return this.state.tasks.find(task => task.getId() === taskId) || null;
    }
    // Filtering and Selection
    setFilter(filter) {
        this.state.filter = filter;
    }
    getFilteredTasks() {
        return this.state.tasks.filter(task => {
            const { status, priority, tags } = this.state.filter;
            if (status && task.getStatus() !== status)
                return false;
            if (priority && task.getPriority() !== priority)
                return false;
            if ((tags === null || tags === void 0 ? void 0 : tags.length) && !tags.some(tag => task.getTags().includes(tag)))
                return false;
            return true;
        });
    }
    setSelectedTask(taskId) {
        this.state.selectedTaskId = taskId;
    }
    getSelectedTask() {
        return this.state.selectedTaskId
            ? this.getTaskById(this.state.selectedTaskId)
            : null;
    }
    // Analytics
    getEfficiencyScore(timeframe) {
        const now = new Date();
        const tasks = this.state.tasks.filter(task => {
            const completedAt = task.getCompletedAt();
            if (!completedAt)
                return false;
            switch (timeframe) {
                case 'daily':
                    return completedAt.getDate() === now.getDate();
                case 'weekly':
                    const weekAgo = new Date(now.setDate(now.getDate() - 7));
                    return completedAt >= weekAgo;
                case 'monthly':
                    return completedAt.getMonth() === now.getMonth();
                case 'yearly':
                    return completedAt.getFullYear() === now.getFullYear();
            }
        });
        if (tasks.length === 0)
            return 0;
        const efficiencyScores = tasks.map(task => ({
            score: task.calculateEfficiency(),
            priority: task.getPriority()
        }));
        // Weight by priority
        const priorityWeights = {
            [TaskPriority.LOW]: 1,
            [TaskPriority.MEDIUM]: 2,
            [TaskPriority.HIGH]: 3,
            [TaskPriority.CRITICAL]: 4
        };
        const weightedSum = efficiencyScores.reduce((sum, { score, priority }) => sum + (score * priorityWeights[priority]), 0);
        const weightSum = efficiencyScores.reduce((sum, { priority }) => sum + priorityWeights[priority], 0);
        return weightedSum / weightSum;
    }
    // Serialization
    toJSON() {
        return {
            tasks: this.state.tasks.map(task => task.toJSON()),
            selectedTaskId: this.state.selectedTaskId,
            filter: this.state.filter
        };
    }
    loadFromJSON(data) {
        this.state.tasks = data.tasks.map((taskData) => Task.fromJSON(taskData));
        this.state.selectedTaskId = data.selectedTaskId;
        this.state.filter = data.filter;
    }
}
// Create the Zustand store
export const useTaskStore = create((set) => ({
    implementation: new TaskStoreImplementation()
}));
