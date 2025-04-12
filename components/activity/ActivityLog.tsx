'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Undo2, Redo2 } from 'lucide-react'
import { ActivityLogService } from '@/services/ActivityLogService'
import { Command } from '@/models/Command'

export function ActivityLog() {
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [history, setHistory] = useState<Command[]>([])
  
  useEffect(() => {
    const activityLog = ActivityLogService.getInstance()
    
    const updateState = () => {
      setCanUndo(activityLog.canUndo())
      setCanRedo(activityLog.canRedo())
      setHistory(activityLog.getHistory())
    }

    // Initial state
    updateState()

    // Subscribe to changes
    const unsubscribe = activityLog.subscribe(updateState)
    return () => unsubscribe()
  }, [])

  const handleUndo = () => {
    const activityLog = ActivityLogService.getInstance()
    if (activityLog.canUndo()) {
      activityLog.undo()
    }
  }

  const handleRedo = () => {
    const activityLog = ActivityLogService.getInstance()
    if (activityLog.canRedo()) {
      activityLog.redo()
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
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
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet</p>
          ) : (
            history.map((command, index) => (
              <div 
                key={index}
                className="text-sm flex items-center justify-between py-1 border-b last:border-0"
              >
                <span>{command.description}</span>
                <span className="text-muted-foreground">
                  {formatTimestamp(command.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}