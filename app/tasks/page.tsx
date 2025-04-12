'use client'

import { TaskList } from "@/components/tasks/TaskList"
import { TaskFilter } from "@/components/tasks/TaskFilter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TasksPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-4">
          <TaskFilter />
        </Card>
        <div className="col-span-3">
          <TaskList />
        </div>
      </div>
    </div>
  )
}
