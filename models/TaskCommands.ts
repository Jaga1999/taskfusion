import { BaseCommand } from './Command';
import { Task } from './Task';
import { DatabaseManager } from '../services/DatabaseManager';

export class CreateTaskCommand extends BaseCommand {
  private task: Task;
  private dbManager: DatabaseManager;

  constructor(task: Task) {
    super(`Create task: ${task.getTitle()}`);
    this.task = task;
    this.dbManager = DatabaseManager.getInstance();
  }

  async execute(): Promise<void> {
    await this.dbManager.createTask(this.task);
  }

  async undo(): Promise<void> {
    await this.dbManager.deleteTask(this.task.getId());
  }
}

export class UpdateTaskCommand extends BaseCommand {
  private taskId: string;
  private oldState: Task;
  private newState: Task;
  private dbManager: DatabaseManager;

  constructor(oldState: Task, newState: Task) {
    super(`Update task: ${newState.getTitle()}`);
    this.taskId = oldState.getId();
    this.oldState = oldState;
    this.newState = newState;
    this.dbManager = DatabaseManager.getInstance();
  }

  async execute(): Promise<void> {
    await this.dbManager.updateTask(this.newState);
  }

  async undo(): Promise<void> {
    await this.dbManager.updateTask(this.oldState);
  }
}

export class DeleteTaskCommand extends BaseCommand {
  private task: Task;
  private dbManager: DatabaseManager;

  constructor(task: Task) {
    super(`Delete task: ${task.getTitle()}`);
    this.task = task;
    this.dbManager = DatabaseManager.getInstance();
  }

  async execute(): Promise<void> {
    await this.dbManager.deleteTask(this.task.getId());
  }

  async undo(): Promise<void> {
    await this.dbManager.createTask(this.task);
  }
}