import mongoose from 'mongoose';
import { TaskPriority, TaskStatus } from '../Task';

let TaskModel: mongoose.Model<any>;

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

// Get the model if it exists, otherwise compile it
export function getTaskModel() {
  if (!TaskModel) {
    TaskModel = mongoose.models.Task || mongoose.model('Task', taskSchema);
  }
  return TaskModel;
}