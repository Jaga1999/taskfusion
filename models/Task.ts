export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done'
}

export class Task {
  private id: string;
  private title: string;
  private description: string;
  private priority: TaskPriority;
  private status: TaskStatus;
  private tags: string[];
  private estimatedTime: number; // in minutes
  private actualTime: number; // in minutes
  private createdAt: Date;
  private updatedAt: Date;
  private completedAt?: Date;

  constructor(data: {
    id?: string;
    title: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    tags?: string[];
    estimatedTime?: number;
    actualTime?: number;
  }) {
    this.id = data.id || crypto.randomUUID();
    this.title = data.title;
    this.description = data.description || '';
    this.priority = data.priority || TaskPriority.MEDIUM;
    this.status = data.status || TaskStatus.TODO;
    this.tags = data.tags || [];
    this.estimatedTime = data.estimatedTime || 0;
    this.actualTime = data.actualTime || 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Getters
  public getId(): string { return this.id; }
  public getTitle(): string { return this.title; }
  public getDescription(): string { return this.description; }
  public getPriority(): TaskPriority { return this.priority; }
  public getStatus(): TaskStatus { return this.status; }
  public getTags(): string[] { return [...this.tags]; }
  public getEstimatedTime(): number { return this.estimatedTime; }
  public getActualTime(): number { return this.actualTime; }
  public getCreatedAt(): Date { return new Date(this.createdAt); }
  public getUpdatedAt(): Date { return new Date(this.updatedAt); }
  public getCompletedAt(): Date | undefined { return this.completedAt ? new Date(this.completedAt) : undefined; }

  // Setters with validation
  public setTitle(title: string): void {
    if (!title.trim()) throw new Error('Title cannot be empty');
    this.title = title;
    this.updateTimestamp();
  }

  public setDescription(description: string): void {
    this.description = description;
    this.updateTimestamp();
  }

  public setPriority(priority: TaskPriority): void {
    this.priority = priority;
    this.updateTimestamp();
  }

  public setStatus(status: TaskStatus): void {
    this.status = status;
    if (status === TaskStatus.DONE && !this.completedAt) {
      this.completedAt = new Date();
    } else if (status !== TaskStatus.DONE) {
      this.completedAt = undefined;
    }
    this.updateTimestamp();
  }

  public setTags(tags: string[]): void {
    this.tags = [...new Set(tags)]; // Remove duplicates
    this.updateTimestamp();
  }

  public setEstimatedTime(minutes: number): void {
    if (minutes < 0) throw new Error('Estimated time cannot be negative');
    this.estimatedTime = minutes;
    this.updateTimestamp();
  }

  public setActualTime(minutes: number): void {
    if (minutes < 0) throw new Error('Actual time cannot be negative');
    this.actualTime = minutes;
    this.updateTimestamp();
  }

  // Business logic methods
  public addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updateTimestamp();
    }
  }

  public removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index > -1) {
      this.tags.splice(index, 1);
      this.updateTimestamp();
    }
  }

  public calculateEfficiency(): number {
    if (this.status !== TaskStatus.DONE || !this.estimatedTime) return 0;
    return Math.min(this.estimatedTime / this.actualTime, 1) * 100;
  }

  private updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  // Serialization
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      priority: this.priority,
      status: this.status,
      tags: [...this.tags],
      estimatedTime: this.estimatedTime,
      actualTime: this.actualTime,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      completedAt: this.completedAt?.toISOString(),
    };
  }

  public static fromJSON(data: Record<string, any>): Task {
    const task = new Task({
      id: data.id,
      title: data.title,
      description: data.description,
      priority: data.priority as TaskPriority,
      status: data.status as TaskStatus,
      tags: data.tags,
      estimatedTime: data.estimatedTime,
      actualTime: data.actualTime,
    });
    
    task.createdAt = new Date(data.createdAt);
    task.updatedAt = new Date(data.updatedAt);
    if (data.completedAt) {
      task.completedAt = new Date(data.completedAt);
    }
    
    return task;
  }
}