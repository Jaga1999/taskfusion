export var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
    TaskPriority["CRITICAL"] = "critical";
})(TaskPriority || (TaskPriority = {}));
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "todo";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["REVIEW"] = "review";
    TaskStatus["DONE"] = "done";
})(TaskStatus || (TaskStatus = {}));
export class Task {
    constructor(data) {
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
    getId() { return this.id; }
    getTitle() { return this.title; }
    getDescription() { return this.description; }
    getPriority() { return this.priority; }
    getStatus() { return this.status; }
    getTags() { return [...this.tags]; }
    getEstimatedTime() { return this.estimatedTime; }
    getActualTime() { return this.actualTime; }
    getCreatedAt() { return new Date(this.createdAt); }
    getUpdatedAt() { return new Date(this.updatedAt); }
    getCompletedAt() { return this.completedAt ? new Date(this.completedAt) : undefined; }
    // Setters with validation
    setTitle(title) {
        if (!title.trim())
            throw new Error('Title cannot be empty');
        this.title = title;
        this.updateTimestamp();
    }
    setDescription(description) {
        this.description = description;
        this.updateTimestamp();
    }
    setPriority(priority) {
        this.priority = priority;
        this.updateTimestamp();
    }
    setStatus(status) {
        this.status = status;
        if (status === TaskStatus.DONE && !this.completedAt) {
            this.completedAt = new Date();
        }
        else if (status !== TaskStatus.DONE) {
            this.completedAt = undefined;
        }
        this.updateTimestamp();
    }
    setTags(tags) {
        this.tags = [...new Set(tags)]; // Remove duplicates
        this.updateTimestamp();
    }
    setEstimatedTime(minutes) {
        if (minutes < 0)
            throw new Error('Estimated time cannot be negative');
        this.estimatedTime = minutes;
        this.updateTimestamp();
    }
    setActualTime(minutes) {
        if (minutes < 0)
            throw new Error('Actual time cannot be negative');
        this.actualTime = minutes;
        this.updateTimestamp();
    }
    // Business logic methods
    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            this.updateTimestamp();
        }
    }
    removeTag(tag) {
        const index = this.tags.indexOf(tag);
        if (index > -1) {
            this.tags.splice(index, 1);
            this.updateTimestamp();
        }
    }
    calculateEfficiency() {
        if (this.status !== TaskStatus.DONE || !this.estimatedTime)
            return 0;
        return Math.min(this.estimatedTime / this.actualTime, 1) * 100;
    }
    updateTimestamp() {
        this.updatedAt = new Date();
    }
    // Serialization
    toJSON() {
        var _a;
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
            completedAt: (_a = this.completedAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
        };
    }
    static fromJSON(data) {
        const task = new Task({
            id: data.id,
            title: data.title,
            description: data.description,
            priority: data.priority,
            status: data.status,
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
