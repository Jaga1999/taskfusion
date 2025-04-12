import { DatabaseService, DatabaseConfig } from './DatabaseService';
import { MongoDBService } from './MongoDBService';
import { SQLiteService } from './SQLiteService';
import { Task } from '../models/Task';
import { create } from 'zustand';

export type DatabaseType = 'mongodb' | 'sqlite';

interface DatabaseState {
  activeDatabase: DatabaseType;
  setActiveDatabase: (type: DatabaseType) => Promise<void>;
}

export const useDatabaseStore = create<DatabaseState>((set) => ({
  activeDatabase: 'sqlite', // Default to SQLite
  setActiveDatabase: async (type) => {
    await DatabaseManager.getInstance().switchDatabase(type);
    set({ activeDatabase: type });
  }
}));

export class DatabaseManager {
  private static instance: DatabaseManager;
  private mongoService: MongoDBService;
  private sqliteService: SQLiteService;
  private activeService: DatabaseService;

  private constructor() {
    this.mongoService = new MongoDBService({
      type: 'mongodb',
      connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017/taskfusion'
    });

    this.sqliteService = new SQLiteService({
      type: 'sqlite',
      connectionString: 'file:./prisma/dev.db'
    });

    this.activeService = this.sqliteService; // Default to SQLite
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async initialize(): Promise<void> {
    await this.sqliteService.connect();
    try {
      await this.mongoService.connect();
    } catch (error) {
      console.warn('MongoDB connection failed, falling back to SQLite only:', error);
    }
  }

  public async switchDatabase(type: DatabaseType): Promise<void> {
    const newService = type === 'mongodb' ? this.mongoService : this.sqliteService;
    
    if (newService === this.activeService) return;

    // Ensure new service is connected
    await newService.connect();

    // Sync before switching
    await this.syncDatabases();

    this.activeService = newService;
  }

  public async syncDatabases(): Promise<void> {
    try {
      const mongoTasks = await this.mongoService.getAllTasks();
      const sqliteTasks = await this.sqliteService.getAllTasks();

      // Create maps for easy lookup
      const mongoMap = new Map(mongoTasks.map(task => [task.getId(), task]));
      const sqliteMap = new Map(sqliteTasks.map(task => [task.getId(), task]));

      // Sync MongoDB to SQLite
      for (const [id, mongoTask] of mongoMap) {
        const sqliteTask = sqliteMap.get(id);
        if (!sqliteTask || new Date(mongoTask.getUpdatedAt()) > new Date(sqliteTask.getUpdatedAt())) {
          await this.sqliteService.createTask(mongoTask);
        }
      }

      // Sync SQLite to MongoDB
      for (const [id, sqliteTask] of sqliteMap) {
        const mongoTask = mongoMap.get(id);
        if (!mongoTask || new Date(sqliteTask.getUpdatedAt()) > new Date(mongoTask.getUpdatedAt())) {
          await this.mongoService.createTask(sqliteTask);
        }
      }
    } catch (error) {
      console.error('Database sync failed:', error);
      throw error;
    }
  }

  // Delegate methods to active service
  public async getAllTasks(): Promise<Task[]> {
    return this.activeService.getAllTasks();
  }

  public async getTaskById(id: string): Promise<Task | null> {
    return this.activeService.getTaskById(id);
  }

  public async createTask(task: Task): Promise<Task> {
    const created = await this.activeService.createTask(task);
    await this.syncDatabases().catch(console.error);
    return created;
  }

  public async updateTask(task: Task): Promise<Task> {
    const updated = await this.activeService.updateTask(task);
    await this.syncDatabases().catch(console.error);
    return updated;
  }

  public async deleteTask(id: string): Promise<boolean> {
    const deleted = await this.activeService.deleteTask(id);
    if (deleted) {
      await this.syncDatabases().catch(console.error);
    }
    return deleted;
  }

  public async cleanup(): Promise<void> {
    await this.mongoService.disconnect();
    await this.sqliteService.disconnect();
  }
}