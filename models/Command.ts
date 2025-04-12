export interface Command {
  execute(): Promise<void>;
  undo(): Promise<void>;
  redo(): Promise<void>;
  getDescription(): string;
  getTimestamp(): Date;
}

export abstract class BaseCommand implements Command {
  protected timestamp: Date;
  protected description: string;

  constructor(description: string) {
    this.timestamp = new Date();
    this.description = description;
  }

  abstract execute(): Promise<void>;
  abstract undo(): Promise<void>;
  
  async redo(): Promise<void> {
    await this.execute();
  }

  getDescription(): string {
    return this.description;
  }

  getTimestamp(): Date {
    return this.timestamp;
  }
}