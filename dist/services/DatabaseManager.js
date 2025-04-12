import { MongoDBService } from './MongoDBService';
import { SQLiteService } from './SQLiteService';
import { create } from 'zustand';
export const useDatabaseStore = create((set) => ({
    activeDatabase: 'sqlite', // Default to SQLite
    setActiveDatabase: async (type) => {
        await DatabaseManager.getInstance().switchDatabase(type);
        set({ activeDatabase: type });
    }
}));
export class DatabaseManager {
    constructor() {
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
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    async initialize() {
        await this.sqliteService.connect();
        try {
            await this.mongoService.connect();
        }
        catch (error) {
            console.warn('MongoDB connection failed, falling back to SQLite only:', error);
        }
    }
    async switchDatabase(type) {
        const newService = type === 'mongodb' ? this.mongoService : this.sqliteService;
        if (newService === this.activeService)
            return;
        // Ensure new service is connected
        await newService.connect();
        // Sync before switching
        await this.syncDatabases();
        this.activeService = newService;
    }
    async syncDatabases() {
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
        }
        catch (error) {
            console.error('Database sync failed:', error);
            throw error;
        }
    }
    // Delegate methods to active service
    async getAllTasks() {
        return this.activeService.getAllTasks();
    }
    async getTaskById(id) {
        return this.activeService.getTaskById(id);
    }
    async createTask(task) {
        const created = await this.activeService.createTask(task);
        await this.syncDatabases().catch(console.error);
        return created;
    }
    async updateTask(task) {
        const updated = await this.activeService.updateTask(task);
        await this.syncDatabases().catch(console.error);
        return updated;
    }
    async deleteTask(id) {
        const deleted = await this.activeService.deleteTask(id);
        if (deleted) {
            await this.syncDatabases().catch(console.error);
        }
        return deleted;
    }
    async cleanup() {
        await this.mongoService.disconnect();
        await this.sqliteService.disconnect();
    }
}
