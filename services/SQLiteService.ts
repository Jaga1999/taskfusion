import { PrismaClient } from '@prisma/client';
import { DatabaseService, DatabaseConfig } from './DatabaseService';
import { Task, TaskPriority, TaskStatus } from '../models/Task';

export class SQLiteService extends DatabaseService {
  private prisma: PrismaClient;
  private connected: boolean = false;

  constructor(config: DatabaseConfig) {
    super(config);
    this.prisma = new PrismaClient();
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      await this.prisma.$connect();
      this.connected = true;
    } catch (error) {
      throw new Error(`SQLite connection failed: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      await this.prisma.$disconnect();
      this.connected = false;
    } catch (error) {
      throw new Error(`SQLite disconnect failed: ${error}`);
    }
  }

  async getAllTasks(): Promise<Task[]> {
    const records = await this.prisma.task.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return records.map(record => this.recordToTask(record));
  }

  async getTaskById(id: string): Promise<Task | null> {
    const record = await this.prisma.task.findUnique({
      where: { id }
    });
    return record ? this.recordToTask(record) : null;
  }

  async createTask(task: Task): Promise<Task> {
    const data = this.taskToRecord(task);
    const record = await this.prisma.task.create({ data });
    return this.recordToTask(record);
  }

  async updateTask(task: Task): Promise<Task> {
    const data = this.taskToRecord(task);
    const record = await this.prisma.task.update({
      where: { id: task.getId() },
      data
    });
    return this.recordToTask(record);
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      await this.prisma.task.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }

  async sync(): Promise<void> {
    // Implement sync logic with MongoDB here
    // This would typically compare updatedAt timestamps
    // and merge changes from both databases
  }

  private recordToTask(record: any): Task {
    return Task.fromJSON({
      ...record,
      tags: JSON.parse(record.tags),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      completedAt: record.completedAt?.toISOString()
    });
  }

  private taskToRecord(task: Task): any {
    const data = task.toJSON();
    return {
      ...data,
      tags: JSON.stringify(data.tags),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : null
    };
  }
}