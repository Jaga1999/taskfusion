import mongoose from 'mongoose';
import { DatabaseService, DatabaseConfig } from './DatabaseService';
import { Task } from '../models/Task';
import { getTaskModel } from '../models/mongoose/TaskModel';

export class MongoDBService extends DatabaseService {
  private connected: boolean = false;

  constructor(config: DatabaseConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      await mongoose.connect(this.config.connectionString);
      this.connected = true;
    } catch (error) {
      throw new Error(`MongoDB connection failed: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      await mongoose.disconnect();
      this.connected = false;
    } catch (error) {
      throw new Error(`MongoDB disconnect failed: ${error}`);
    }
  }

  async getAllTasks(): Promise<Task[]> {
    const TaskModel = getTaskModel();
    const documents = await TaskModel.find().sort({ updatedAt: -1 });
    return documents.map(doc => this.documentToTask(doc));
  }

  async getTaskById(id: string): Promise<Task | null> {
    const TaskModel = getTaskModel();
    const document = await TaskModel.findOne({ id });
    return document ? this.documentToTask(document) : null;
  }

  async createTask(task: Task): Promise<Task> {
    const TaskModel = getTaskModel();
    const document = new TaskModel(task.toJSON());
    await document.save();
    return this.documentToTask(document);
  }

  async updateTask(task: Task): Promise<Task> {
    const TaskModel = getTaskModel();
    const document = await TaskModel.findOneAndUpdate(
      { id: task.getId() },
      task.toJSON(),
      { new: true }
    );
    if (!document) throw new Error('Task not found');
    return this.documentToTask(document);
  }

  async deleteTask(id: string): Promise<boolean> {
    const TaskModel = getTaskModel();
    const result = await TaskModel.deleteOne({ id });
    return result.deletedCount === 1;
  }

  async sync(): Promise<void> {
    // MongoDB is our primary database, so sync is a no-op
    return;
  }

  private documentToTask(document: mongoose.Document): Task {
    const data = document.toObject();
    return Task.fromJSON({
      ...data,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      completedAt: data.completedAt?.toISOString()
    });
  }
}