import { PrismaClient } from '@prisma/client';
import { DatabaseService } from './DatabaseService';
import { Task } from '../models/Task';
export class SQLiteService extends DatabaseService {
    constructor(config) {
        super(config);
        this.connected = false;
        this.prisma = new PrismaClient();
    }
    async connect() {
        if (this.connected)
            return;
        try {
            await this.prisma.$connect();
            this.connected = true;
        }
        catch (error) {
            throw new Error(`SQLite connection failed: ${error}`);
        }
    }
    async disconnect() {
        if (!this.connected)
            return;
        try {
            await this.prisma.$disconnect();
            this.connected = false;
        }
        catch (error) {
            throw new Error(`SQLite disconnect failed: ${error}`);
        }
    }
    async getAllTasks() {
        const records = await this.prisma.task.findMany({
            orderBy: { updatedAt: 'desc' }
        });
        return records.map(record => this.recordToTask(record));
    }
    async getTaskById(id) {
        const record = await this.prisma.task.findUnique({
            where: { id }
        });
        return record ? this.recordToTask(record) : null;
    }
    async createTask(task) {
        const data = this.taskToRecord(task);
        const record = await this.prisma.task.create({ data });
        return this.recordToTask(record);
    }
    async updateTask(task) {
        const data = this.taskToRecord(task);
        const record = await this.prisma.task.update({
            where: { id: task.getId() },
            data
        });
        return this.recordToTask(record);
    }
    async deleteTask(id) {
        try {
            await this.prisma.task.delete({
                where: { id }
            });
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async sync() {
        // Implement sync logic with MongoDB here
        // This would typically compare updatedAt timestamps
        // and merge changes from both databases
    }
    recordToTask(record) {
        var _a;
        return Task.fromJSON(Object.assign(Object.assign({}, record), { tags: JSON.parse(record.tags), createdAt: record.createdAt.toISOString(), updatedAt: record.updatedAt.toISOString(), completedAt: (_a = record.completedAt) === null || _a === void 0 ? void 0 : _a.toISOString() }));
    }
    taskToRecord(task) {
        const data = task.toJSON();
        return Object.assign(Object.assign({}, data), { tags: JSON.stringify(data.tags), createdAt: new Date(data.createdAt), updatedAt: new Date(data.updatedAt), completedAt: data.completedAt ? new Date(data.completedAt) : null });
    }
}
