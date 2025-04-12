import { create } from 'zustand';
import { Task, TaskPriority, TaskStatus } from '../models/Task';

interface TaskState {
  tasks: Task[];
  selectedTaskId: string | null;
  filter: {
    status?: TaskStatus;
    priority?: TaskPriority;
    tags?: string[];
  };
}

class TaskStoreImplementation {
  private state: TaskState = {
    tasks: [],
    selectedTaskId: null,
    filter: {}
  };

  // Task CRUD operations
  public addTask(taskData: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    tags?: string[];
    estimatedTime?: number;
  }): Task {
    const task = new Task(taskData);
    this.state.tasks.push(task);
    return task;
  }

  public updateTask(taskId: string, updates: Partial<{
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    tags: string[];
    estimatedTime: number;
    actualTime: number;
  }>): Task | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    if (updates.title) task.setTitle(updates.title);
    if (updates.description) task.setDescription(updates.description);
    if (updates.priority) task.setPriority(updates.priority);
    if (updates.status) task.setStatus(updates.status);
    if (updates.tags) task.setTags(updates.tags);
    if (updates.estimatedTime) task.setEstimatedTime(updates.estimatedTime);
    if (updates.actualTime) task.setActualTime(updates.actualTime);

    return task;
  }

  public deleteTask(taskId: string): boolean {
    const index = this.state.tasks.findIndex(task => task.getId() === taskId);
    if (index === -1) return false;
    
    this.state.tasks.splice(index, 1);
    if (this.state.selectedTaskId === taskId) {
      this.state.selectedTaskId = null;
    }
    return true;
  }

  public getTaskById(taskId: string): Task | null {
    return this.state.tasks.find(task => task.getId() === taskId) || null;
  }

  // Filtering and Selection
  public setFilter(filter: TaskState['filter']): void {
    this.state.filter = filter;
  }

  public getFilteredTasks(): Task[] {
    return this.state.tasks.filter(task => {
      const { status, priority, tags } = this.state.filter;
      if (status && task.getStatus() !== status) return false;
      if (priority && task.getPriority() !== priority) return false;
      if (tags?.length && !tags.some(tag => task.getTags().includes(tag))) return false;
      return true;
    });
  }

  public setSelectedTask(taskId: string | null): void {
    this.state.selectedTaskId = taskId;
  }

  public getSelectedTask(): Task | null {
    return this.state.selectedTaskId 
      ? this.getTaskById(this.state.selectedTaskId)
      : null;
  }

  // Analytics
  public getEfficiencyScore(timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly'): number {
    const now = new Date();
    const tasks = this.state.tasks.filter(task => {
      const completedAt = task.getCompletedAt();
      if (!completedAt) return false;

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

    if (tasks.length === 0) return 0;

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

    const weightedSum = efficiencyScores.reduce((sum, { score, priority }) => 
      sum + (score * priorityWeights[priority]), 0);
    const weightSum = efficiencyScores.reduce((sum, { priority }) => 
      sum + priorityWeights[priority], 0);

    return weightedSum / weightSum;
  }

  // Serialization
  public toJSON(): Record<string, any> {
    return {
      tasks: this.state.tasks.map(task => task.toJSON()),
      selectedTaskId: this.state.selectedTaskId,
      filter: this.state.filter
    };
  }

  public loadFromJSON(data: Record<string, any>): void {
    this.state.tasks = data.tasks.map((taskData: any) => Task.fromJSON(taskData));
    this.state.selectedTaskId = data.selectedTaskId;
    this.state.filter = data.filter;
  }
}

// Create the Zustand store
export const useTaskStore = create<{
  implementation: TaskStoreImplementation;
}>((set) => ({
  implementation: new TaskStoreImplementation()
}));