import { create } from 'zustand'
import { Task, TaskPriority, TaskStatus } from '../models/Task'
import { DatabaseService } from '../services/DatabaseService'
import { ActivityLogService } from '../services/ActivityLogService'

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

export const useTaskStore = create<TaskState>((set, get) => ({
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
      
      await DatabaseService.addTask(task)
      await ActivityLogService.logActivity('create_task', { taskId: task.getId() })
      
      set(state => ({
        tasks: [...state.tasks, task]
      }))
    },
    updateTask: async (taskId: string, taskData: Partial<Task>) => {
      await DatabaseService.updateTask(taskId, taskData)
      await ActivityLogService.logActivity('update_task', { taskId })
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task.getId() === taskId ? { ...task, ...taskData } : task
        )
      }))
    },
    deleteTask: async (taskId: string) => {
      await DatabaseService.deleteTask(taskId)
      await ActivityLogService.logActivity('delete_task', { taskId })
      
      set(state => ({
        tasks: state.tasks.filter(task => task.getId() !== taskId)
      }))
    },
    setFilter: (filter: Partial<TaskState['filter']>) => {
      set(state => ({
        filter: { ...state.filter, ...filter }
      }))
    },
    loadTasks: async () => {
      const tasks = await DatabaseService.getTasks()
      set({ tasks })
    }
  }
}))