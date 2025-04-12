'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import { useTaskStore } from "@/store/TaskStore"
import { useLoadingStore } from "@/store/LoadingStore"
import { TaskPriority, TaskStatus, Task } from '@/models/Task'
import { Loader2, Plus, Trash2, ArrowUpDown } from 'lucide-react'

type SortOption = 'priority' | 'created' | 'updated' | 'title';
type SortDirection = 'asc' | 'desc';

export function TaskList() {
  // Get store implementation with memoized selector
  const storeImplementation = useTaskStore(
    useCallback(state => state.implementation, [])
  )
  
  // Memoize the filtered tasks
  const tasks = useMemo(
    () => storeImplementation.getFilteredTasks(),
    [storeImplementation]
  )

  const { setLoading, isLoading } = useLoadingStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    tags: '',
    estimatedTime: ''
  })
  const [quickAddTitle, setQuickAddTitle] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('created')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Listen for quick add task shortcut
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron) {
      const cleanup = window.electron.onQuickAddTask(() => {
        setIsQuickAddOpen(true)
      })
      return cleanup
    }
  }, [])

  const handleQuickAdd = async () => {
    if (!quickAddTitle.trim()) return
    setLoading('quickAddTask', true)
    try {
      await storeImplementation.addTask(new Task({
        title: quickAddTitle,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO
      }))
      setQuickAddTitle('')
      setIsQuickAddOpen(false)
    } finally {
      setLoading('quickAddTask', false)
    }
  }

  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortOption) {
        case 'priority':
          const priorityOrder = {
            [TaskPriority.CRITICAL]: 4,
            [TaskPriority.HIGH]: 3,
            [TaskPriority.MEDIUM]: 2,
            [TaskPriority.LOW]: 1
          };
          return multiplier * (priorityOrder[b.getPriority()] - priorityOrder[a.getPriority()]);
          
        case 'created':
          return multiplier * (b.getCreatedAt().getTime() - a.getCreatedAt().getTime());
          
        case 'updated':
          const aUpdated = a.getUpdatedAt()?.getTime() || 0;
          const bUpdated = b.getUpdatedAt()?.getTime() || 0;
          return multiplier * (bUpdated - aUpdated);
          
        case 'title':
          return multiplier * a.getTitle().localeCompare(b.getTitle());
          
        default:
          return 0;
      }
    });
  };

  const sortedTasks = sortTasks(tasks)

  const handleSubmit = async () => {
    setLoading('createTask', true)
    try {
      await storeImplementation.addTask(new Task({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined
      }))
      setIsDialogOpen(false)
      setFormData({
        title: '',
        description: '',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        tags: '',
        estimatedTime: ''
      })
    } finally {
      setLoading('createTask', false)
    }
  }

  const handleDelete = async (taskId: string) => {
    setLoading(`deleteTask-${taskId}`, true)
    try {
      await storeImplementation.deleteTask(taskId)
    } finally {
      setLoading(`deleteTask-${taskId}`, false)
    }
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    setLoading(`updateTask-${taskId}`, true)
    try {
      await storeImplementation.updateTask(taskId, { status } as Partial<Task>)
    } finally {
      setLoading(`updateTask-${taskId}`, false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with sort controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Tasks</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Select
              value={sortOption}
              onValueChange={(value: SortOption) => setSortOption(value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Sort by Priority</SelectItem>
                <SelectItem value="created">Sort by Created Date</SelectItem>
                <SelectItem value="updated">Sort by Updated Date</SelectItem>
                <SelectItem value="title">Sort by Title</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <ArrowUpDown className={`h-4 w-4 transition-transform ${
                sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'
              }`} />
            </Button>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: TaskPriority) => 
                        setFormData(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TaskPriority).map(priority => (
                          <SelectItem key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      value={formData.estimatedTime}
                      onChange={e => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g. urgent, feature, bug"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.title || isLoading('createTask')}
                >
                  {isLoading('createTask') && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Add Dialog */}
      <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Quick Add Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Task title"
                value={quickAddTitle}
                onChange={(e) => setQuickAddTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleQuickAdd()
                  }
                }}
                autoFocus
              />
              <Button 
                onClick={handleQuickAdd}
                disabled={!quickAddTitle || isLoading('quickAddTask')}
              >
                {isLoading('quickAddTask') ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Add'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task List */}
      <div className="grid gap-4">
        {sortedTasks.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No tasks yet. Click the button above to create one.
          </p>
        )}
        {sortedTasks.map(task => (
          <div
            key={task.getId()}
            className="p-4 border rounded-md shadow-sm bg-background"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <h3 className="text-lg font-medium leading-none">{task.getTitle()}</h3>
                <p className="text-sm text-muted-foreground">{task.getDescription()}</p>
                {task.getTags().length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {task.getTags().map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={task.getStatus()}
                  onValueChange={(value: TaskStatus) => handleStatusChange(task.getId(), value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TaskStatus).map(status => (
                      <SelectItem key={status} value={status}>
                        {status.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(task.getId())}
                  disabled={isLoading(`deleteTask-${task.getId()}`)}
                >
                  {isLoading(`deleteTask-${task.getId()}`) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}