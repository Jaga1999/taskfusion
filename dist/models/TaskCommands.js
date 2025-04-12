import { BaseCommand } from './Command';
import { DatabaseManager } from '../services/DatabaseManager';
export class CreateTaskCommand extends BaseCommand {
    constructor(task) {
        super(`Create task: ${task.getTitle()}`);
        this.task = task;
        this.dbManager = DatabaseManager.getInstance();
    }
    async execute() {
        await this.dbManager.createTask(this.task);
    }
    async undo() {
        await this.dbManager.deleteTask(this.task.getId());
    }
}
export class UpdateTaskCommand extends BaseCommand {
    constructor(oldState, newState) {
        super(`Update task: ${newState.getTitle()}`);
        this.taskId = oldState.getId();
        this.oldState = oldState;
        this.newState = newState;
        this.dbManager = DatabaseManager.getInstance();
    }
    async execute() {
        await this.dbManager.updateTask(this.newState);
    }
    async undo() {
        await this.dbManager.updateTask(this.oldState);
    }
}
export class DeleteTaskCommand extends BaseCommand {
    constructor(task) {
        super(`Delete task: ${task.getTitle()}`);
        this.task = task;
        this.dbManager = DatabaseManager.getInstance();
    }
    async execute() {
        await this.dbManager.deleteTask(this.task.getId());
    }
    async undo() {
        await this.dbManager.createTask(this.task);
    }
}
