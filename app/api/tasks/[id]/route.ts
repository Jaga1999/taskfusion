import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Task } from '@/models/Task'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id }
    })
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    return NextResponse.json(Task.fromJSON(task))
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskData = await request.json()
    const task = new Task({ id: params.id, ...taskData })
    const taskJson = task.toJSON()
    
    // Map the Task model to Prisma's expected format
    const prismaData = {
      title: taskJson.title,
      description: taskJson.description,
      priority: taskJson.priority,
      status: taskJson.status,
      tags: taskJson.tags,
      estimatedTime: taskJson.estimatedTime,
      actualTime: taskJson.actualTime,
      updatedAt: new Date(taskJson.updatedAt),
      completedAt: taskJson.completedAt ? new Date(taskJson.completedAt) : null
    }
    
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: prismaData
    })
    
    return NextResponse.json(Task.fromJSON(updatedTask))
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.task.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}