import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Task } from '@/models/Task'

export async function GET() {
  try {
    const tasks = await prisma.task.findMany()
    // Parse the tags JSON string back to array when returning tasks
    const tasksWithParsedTags = tasks.map(task => ({
      ...task,
      tags: JSON.parse(task.tags)
    }))
    return NextResponse.json(tasksWithParsedTags.map(task => Task.fromJSON(task)))
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
      tags: JSON.stringify(taskJson.tags), // Convert tags array to JSON string
      estimatedTime: taskJson.estimatedTime,
      actualTime: taskJson.actualTime,
      createdAt: new Date(taskJson.createdAt),
      updatedAt: new Date(taskJson.updatedAt),
      completedAt: taskJson.completedAt ? new Date(taskJson.completedAt) : null
    }
    
    const createdTask = await prisma.task.create({ data: prismaData })
    // Parse the tags JSON string back to array when returning the created task
    const taskWithParsedTags = {
      ...createdTask,
      tags: JSON.parse(createdTask.tags)
    }
    return NextResponse.json(Task.fromJSON(taskWithParsedTags))
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}