import mongoose from 'mongoose';
import { DatabaseService } from './DatabaseService';
import { Task, TaskPriority, TaskStatus } from '../models/Task';
// Mongoose Schema
const taskSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    priority: {
        type: String,
        enum: Object.values(TaskPriority),
        default: TaskPriority.MEDIUM
    },
    status: {
        type: String,
        enum: Object.values(TaskStatus),
        default: TaskStatus.TODO
    },
    tags: [{ type: String }],
    estimatedTime: { type: Number, default: 0 },
    actualTime: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null }
});
const TaskModel = mongoose.model('Task', taskSchema);
export class MongoDBService extends DatabaseService {
    constructor(config) {
        super(config);
        this.connected = false;
    }
    async connect() {
        if (this.connected)
            return;
        try {
            await mongoose.connect(this.config.connectionString);
            this.connected = true;
        }
        catch (error) {
            throw new Error(`MongoDB connection failed: ${error}`);
        }
    }
    async disconnect() {
        if (!this.connected)
            return;
        try {
            await mongoose.disconnect();
            this.connected = false;
        }
        catch (error) {
            throw new Error(`MongoDB disconnect failed: ${error}`);
        }
    }
    async getAllTasks() {
        const documents = await TaskModel.find().sort({ updatedAt: -1 });
        return documents.map(doc => this.documentToTask(doc));
    }
    async getTaskById(id) {
        const document = await TaskModel.findOne({ id });
        return document ? this.documentToTask(document) : null;
    }
    async createTask(task) {
        const document = new TaskModel(task.toJSON());
        await document.save();
        return this.documentToTask(document);
    }
    async updateTask(task) {
        const document = await TaskModel.findOneAndUpdate({ id: task.getId() }, task.toJSON(), { new: true });
        if (!document)
            throw new Error('Task not found');
        return this.documentToTask(document);
    }
    async deleteTask(id) {
        const result = await TaskModel.deleteOne({ id });
        return result.deletedCount === 1;
    }
    async sync() {
        // MongoDB is our primary database, so sync is a no-op
        return;
    }
    documentToTask(document) {
        var _a;
        const data = document.toObject();
        return Task.fromJSON(Object.assign(Object.assign({}, data), { createdAt: data.createdAt.toISOString(), updatedAt: data.updatedAt.toISOString(), completedAt: (_a = data.completedAt) === null || _a === void 0 ? void 0 : _a.toISOString() }));
    }
}
