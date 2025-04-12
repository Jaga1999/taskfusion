'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { TaskPriority, TaskStatus } from '@/models/Task'
import { useTaskStore } from '@/store/TaskStore'
import { Filter, X } from 'lucide-react'
import { Card } from "@/components/ui/card"

export function TaskFilter() {
  const { filter, implementation } = useTaskStore()

  const [tagInput, setTagInput] = useState('')

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (!trimmedTag) return
    
    const currentTags = filter.tags || []
    implementation.setFilter({
      ...filter,
      tags: [...currentTags, trimmedTag]
    })
    setTagInput('')
  }

  const removeTag = (tagToRemove: string) => {
    implementation.setFilter({
      ...filter,
      tags: filter.tags?.filter((tag: string) => tag !== tagToRemove)
    })
  }

  const clearFilters = () => {
    implementation.setFilter({})
    setTagInput('')
  }

  const hasFilters = !!(filter.status || filter.priority || filter.tags?.length)

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-muted-foreground"
          >
            Clear
          </Button>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <Select
            value={filter?.status || ""}
            onValueChange={(value) => implementation.setFilter({ status: value as TaskStatus })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {Object.values(TaskStatus).map(status => (
                <SelectItem key={status} value={status}>
                  {status.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={filter?.priority || ""}
            onValueChange={(value) => implementation.setFilter({ priority: value as TaskPriority })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              {Object.values(TaskPriority).map(priority => (
                <SelectItem key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <Input
              placeholder="Add tags to filter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  addTag(tagInput)
                }
              }}
            />
          </div>
          {filter.tags && filter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filter.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {tag} tag</span>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}