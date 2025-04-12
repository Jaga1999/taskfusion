import { create } from 'zustand'
import { Task, TaskPriority, TaskStatus } from '../models/Task'
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
    getEfficiencyScore: (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => number
  }
}

export const useTaskStore = create<TaskState>((set, get) => {
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

        try {
          const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task.toJSON())
          })

          if (!response.ok) throw new Error('Failed to create task')
          
          const createdTask = Task.fromJSON(await response.json())
          
          await activityLog.executeCommand({
            execute: async () => {},
            undo: async () => {},
            redo: async () => {},
            getDescription: () => `Create task: ${createdTask.getTitle()}`,
            getTimestamp: () => new Date()
          })

          set(state => ({
            tasks: [...state.tasks, createdTask]
          }))
        } catch (error) {
          console.error('Failed to create task:', error)
          throw error
        }
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

        try {
          const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask.toJSON())
          })

          if (!response.ok) throw new Error('Failed to update task')
          
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
        } catch (error) {
          console.error('Failed to update task:', error)
          throw error
        }
      },
      deleteTask: async (taskId: string) => {
        const task = get().tasks.find(t => t.getId() === taskId)
        if (!task) return

        try {
          const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
          })

          if (!response.ok) throw new Error('Failed to delete task')
          
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
        } catch (error) {
          console.error('Failed to delete task:', error)
          throw error
        }
      },
      setFilter: (filter: Partial<TaskState['filter']>) => {
        set(state => ({
          filter: { ...state.filter, ...filter }
        }))
      },
      loadTasks: async () => {
        try {
          const response = await fetch('/api/tasks')
          if (!response.ok) throw new Error('Failed to load tasks')
          
          const tasks = (await response.json()).map((task: any) => Task.fromJSON(task))
          set({ tasks })
        } catch (error) {
          console.error('Failed to load tasks:', error)
          throw error
        }
      },
      getEfficiencyScore: (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
        const tasks = get().tasks
        const now = new Date()
        
        // Get start date based on period
        const getStartDate = () => {
          switch (period) {
            case 'daily':
              return new Date(now.getFullYear(), now.getMonth(), now.getDate())
            case 'weekly':
              const weekStart = new Date(now)
              weekStart.setDate(now.getDate() - now.getDay())
              return weekStart
            case 'monthly':
              return new Date(now.getFullYear(), now.getMonth(), 1)
            case 'yearly':
              return new Date(now.getFullYear(), 0, 1)
          }
        }

        const startDate = getStartDate()
        const periodTasks = tasks.filter(task => {
          const taskDate = task.getCreatedAt()
          return taskDate >= startDate && taskDate <= now
        })

        if (periodTasks.length === 0) return 0

        // Calculate average efficiency
        const totalEfficiency = periodTasks.reduce((sum, task) => sum + task.calculateEfficiency(), 0)
        return totalEfficiency / periodTasks.length
      }
    }
  }
})