'use client'

import { TaskTimeline } from "@/components/timeline/TaskTimeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TimelinePage() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Task Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <TaskTimeline />
      </CardContent>
    </Card>
  )
}