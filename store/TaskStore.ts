import { create } from 'zustand'
import { Task, TaskPriority, TaskStatus } from '../models/Task'
import { DatabaseService } from '../services/DatabaseService'
import { ActivityLogService } from '../services/ActivityLogService'
import { DatabaseManager } from '../services/DatabaseManager'

interface TaskState {
  tasks: Task[]
  filter: {
    search: string
    status?: TaskStatus
    priority?: TaskPriority
    tags?: string[]
  }
  implementation: {
    getTasks: () => Task[]
    getFilteredTasks: () => Task[]
    addTask: (taskData: Partial<Task>) => Promise<void>
    updateTask: (taskId: string, taskData: Partial<Task>) => Promise<void>
    deleteTask: (taskId: string) => Promise<void>
    setFilter: (filter: Partial<TaskState['filter']>) => void
    loadTasks: () => Promise<void>
  }
}

export const useTaskStore = create<TaskState>((set, get) => {
  const dbManager = DatabaseManager.getInstance()
  const activityLog = ActivityLogService.getInstance()

  return {
    tasks: [],
    filter: {
      search: '',
    },
    implementation: {
      getTasks: () => get().tasks,
      getFilteredTasks: () => {
        const { tasks, filter } = get()
        return tasks.filter(task => {
          if (filter.search && !task.getTitle().toLowerCase().includes(filter.search.toLowerCase())) {
            return false
          }
          if (filter.status && task.getStatus() !== filter.status) {
            return false
          }
          if (filter.priority && task.getPriority() !== filter.priority) {
            return false
          }
          if (filter.tags && filter.tags.length > 0) {
            const taskTags = task.getTags()
            if (!filter.tags.some(tag => taskTags.includes(tag))) {
              return false
            }
          }
          return true
        })
      },
      addTask: async (taskData: Partial<Task>) => {
        const task = new Task({
          title: taskData.getTitle?.() || '',
          description: taskData.getDescription?.() || '',
          status: taskData.getStatus?.() || TaskStatus.TODO,
          priority: taskData.getPriority?.() || TaskPriority.MEDIUM,
          tags: taskData.getTags?.() || [],
          estimatedTime: taskData.getEstimatedTime?.(),
        })
        
        await dbManager.createTask(task)
        await activityLog.executeCommand({
          execute: async () => {},
          undo: async () => {},
          redo: async () => {},
          getDescription: () => `Create task: ${task.getTitle()}`,
          getTimestamp: () => new Date()
        })
        
        set(state => ({
          tasks: [...state.tasks, task]
        }))
      },
      updateTask: async (taskId: string, updates: Partial<Task>) => {
        const task = get().tasks.find(t => t.getId() === taskId)
        if (!task) return

        const updatedTask = new Task({
          id: task.getId(),
          title: updates.getTitle?.() || task.getTitle(),
          description: updates.getDescription?.() || task.getDescription(),
          priority: updates.getPriority?.() || task.getPriority(),
          status: updates.getStatus?.() || task.getStatus(),
          tags: updates.getTags?.() || task.getTags(),
          estimatedTime: updates.getEstimatedTime?.() || task.getEstimatedTime(),
          actualTime: updates.getActualTime?.() || task.getActualTime()
        })
        
        await dbManager.updateTask(updatedTask)
        await activityLog.executeCommand({
          execute: async () => {},
          undo: async () => {},
          redo: async () => {},
          getDescription: () => `Update task: ${updatedTask.getTitle()}`,
          getTimestamp: () => new Date()
        })
        
        set(state => ({
          tasks: state.tasks.map(t => t.getId() === taskId ? updatedTask : t)
        }))
      },
      deleteTask: async (taskId: string) => {
        const task = get().tasks.find(t => t.getId() === taskId)
        if (!task) return
        
        await dbManager.deleteTask(taskId)
        await activityLog.executeCommand({
          execute: async () => {},
          undo: async () => {},
          redo: async () => {},
          getDescription: () => `Delete task: ${task.getTitle()}`,
          getTimestamp: () => new Date()
        })
        
        set(state => ({
          tasks: state.tasks.filter(t => t.getId() !== taskId)
        }))
      },
      setFilter: (filter: Partial<TaskState['filter']>) => {
        set(state => ({
          filter: { ...state.filter, ...filter }
        }))
      },
      loadTasks: async () => {
        const tasks = await dbManager.getAllTasks()
        set({ tasks })
      }
    }
  }
})