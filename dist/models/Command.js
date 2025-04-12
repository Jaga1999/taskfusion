export class BaseCommand {
    constructor(description) {
        this.timestamp = new Date();
        this.description = description;
    }
    async redo() {
        await this.execute();
    }
    getDescription() {
        return this.description;
    }
    getTimestamp() {
        return this.timestamp;
    }
}
