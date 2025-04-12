'use client'

import { useEffect, useState } from 'react'
import Timeline from 'react-calendar-timeline'
import 'react-calendar-timeline/lib/Timeline.css'
import moment from 'moment'
import { Task } from '@/models/Task'
import { useTaskStore } from '@/store/TaskStore'

interface TimelineGroup {
  id: number
  title: string
}

interface TimelineItem {
  id: string
  group: number
  title: string
  start_time: number
  end_time: number
  itemProps?: {
    style?: {
      background: string
    }
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return '#ef4444'
    case 'high':
      return '#f97316'
    case 'medium':
      return '#eab308'
    case 'low':
      return '#22c55e'
    default:
      return '#94a3b8'
  }
}

export function TaskTimeline() {
  const taskStore = useTaskStore(state => state.implementation)
  const [groups, setGroups] = useState<TimelineGroup[]>([])
  const [items, setItems] = useState<TimelineItem[]>([])

  useEffect(() => {
    const tasks = taskStore.getFilteredTasks()
    const uniqueStatuses = Array.from(new Set(tasks.map(task => task.getStatus())))
    
    // Create groups based on task statuses
    const newGroups: TimelineGroup[] = uniqueStatuses.map((status, index) => ({
      id: index + 1,
      title: status.charAt(0).toUpperCase() + status.slice(1)
    }))

    // Create timeline items from tasks
    const newItems: TimelineItem[] = tasks.map(task => {
      const statusIndex = uniqueStatuses.indexOf(task.getStatus()) + 1
      const startTime = task.getCreatedAt().getTime()
      const endTime = task.getCompletedAt()?.getTime() || moment().add(1, 'day').valueOf()

      return {
        id: task.getId(),
        group: statusIndex,
        title: task.getTitle(),
        start_time: startTime,
        end_time: endTime,
        itemProps: {
          style: {
            background: getPriorityColor(task.getPriority())
          }
        }
      }
    })

    setGroups(newGroups)
    setItems(newItems)
  }, [taskStore])

  // Default time window: show from 1 week ago to 1 week from now
  const defaultTimeStart = moment().subtract(1, 'week').valueOf()
  const defaultTimeEnd = moment().add(1, 'week').valueOf()

  if (groups.length === 0 || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No tasks to display in timeline</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-12rem)] w-full">
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={defaultTimeStart}
        defaultTimeEnd={defaultTimeEnd}
        canMove={false}
        canResize={false}
        stackItems
        sidebarWidth={150}
        lineHeight={50}
        itemHeightRatio={0.8}
      />
    </div>
  )
}