export var TimerState;
(function (TimerState) {
    TimerState["IDLE"] = "idle";
    TimerState["RUNNING"] = "running";
    TimerState["PAUSED"] = "paused";
    TimerState["BREAK"] = "break";
})(TimerState || (TimerState = {}));
export class Timer {
    constructor() {
        this.state = TimerState.IDLE;
        this.remainingTime = Timer.POMODORO_DURATION;
        this.completedPomodoros = 0;
    }
    start(taskId, onTick, onComplete) {
        if (this.state === TimerState.RUNNING)
            return;
        this.taskId = taskId;
        this.onTick = onTick;
        this.onComplete = onComplete;
        this.state = TimerState.RUNNING;
        this.intervalId = setInterval(() => {
            var _a;
            this.remainingTime--;
            (_a = this.onTick) === null || _a === void 0 ? void 0 : _a.call(this, this.remainingTime);
            if (this.remainingTime <= 0) {
                this.complete();
            }
        }, 1000);
    }
    pause() {
        if (this.state !== TimerState.RUNNING)
            return;
        clearInterval(this.intervalId);
        this.state = TimerState.PAUSED;
    }
    resume() {
        if (this.state !== TimerState.PAUSED)
            return;
        this.start(this.taskId, this.onTick, this.onComplete);
    }
    reset() {
        clearInterval(this.intervalId);
        this.state = TimerState.IDLE;
        this.remainingTime = Timer.POMODORO_DURATION;
        this.taskId = undefined;
    }
    complete() {
        var _a;
        clearInterval(this.intervalId);
        this.completedPomodoros++;
        if (this.completedPomodoros % 4 === 0) {
            this.startLongBreak();
        }
        else {
            this.startShortBreak();
        }
        (_a = this.onComplete) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    startShortBreak() {
        this.state = TimerState.BREAK;
        this.remainingTime = Timer.SHORT_BREAK_DURATION;
    }
    startLongBreak() {
        this.state = TimerState.BREAK;
        this.remainingTime = Timer.LONG_BREAK_DURATION;
    }
    // Getters
    getState() {
        return this.state;
    }
    getRemainingTime() {
        return this.remainingTime;
    }
    getCompletedPomodoros() {
        return this.completedPomodoros;
    }
    getTaskId() {
        return this.taskId;
    }
    // Formatting utilities
    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}
Timer.POMODORO_DURATION = 25 * 60; // 25 minutes in seconds
Timer.SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
Timer.LONG_BREAK_DURATION = 15 * 60; // 15 minutes
