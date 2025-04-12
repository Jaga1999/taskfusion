'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Undo2, Redo2 } from 'lucide-react'
import { ActivityLogService } from '@/services/ActivityLogService'
import { Command } from '@/models/Command'
import { useActivityLogStore } from '@/services/ActivityLogService'

export function ActivityLog() {
  const { activities, canUndo, canRedo, updateState } = useActivityLogStore()
  const activityLog = ActivityLogService.getInstance()

  useEffect(() => {
    // Load initial activities
    updateState()

    // Set up listener for new activities
    const unsubscribe = activityLog.onActivityAdded(() => {
      updateState()
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [updateState])

  const handleUndo = async () => {
    await activityLog.undo()
    updateState()
  }

  const handleRedo = async () => {
    await activityLog.redo()
    updateState()
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Activity Log</CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            disabled={!canUndo}
            onClick={handleUndo}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            disabled={!canRedo}
            onClick={handleRedo}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((command: Command) => (
            <div key={command.getTimestamp().getTime()} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <span>{command.getDescription()}</span>
              </div>
              <time className="text-sm text-muted-foreground">
                {formatTimestamp(command.getTimestamp())}
              </time>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}