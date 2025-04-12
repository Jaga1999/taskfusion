import { Task } from '../models/Task';

export interface DatabaseConfig {
  type: 'mongodb' | 'sqlite';
  connectionString: string;
}

export abstract class DatabaseService {
  protected config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract getAllTasks(): Promise<Task[]>;
  abstract getTaskById(id: string): Promise<Task | null>;
  abstract createTask(task: Task): Promise<Task>;
  abstract updateTask(task: Task): Promise<Task>;
  abstract deleteTask(id: string): Promise<boolean>;
  abstract sync(): Promise<void>;
}