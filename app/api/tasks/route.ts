import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Task } from '@/models/Task'

export async function GET() {
  try {
    const tasks = await prisma.task.findMany()
    return NextResponse.json(tasks.map(task => Task.fromJSON(task)))
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const taskData = await request.json()
    const task = new Task(taskData)
    const taskJson = task.toJSON()
    
    // Map the Task model to Prisma's expected format
    const prismaData = {
      id: taskJson.id,
      title: taskJson.title,
      description: taskJson.description,
      priority: taskJson.priority,
      status: taskJson.status,
      tags: taskJson.tags,
      estimatedTime: taskJson.estimatedTime,
      actualTime: taskJson.actualTime,
      createdAt: new Date(taskJson.createdAt),
      updatedAt: new Date(taskJson.updatedAt),
      completedAt: taskJson.completedAt ? new Date(taskJson.completedAt) : null
    }
    
    const createdTask = await prisma.task.create({ data: prismaData })
    return NextResponse.json(Task.fromJSON(createdTask))
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}