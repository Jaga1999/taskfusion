export enum TimerState {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  BREAK = 'break'
}

export class Timer {
  private static readonly POMODORO_DURATION = 25 * 60; // 25 minutes in seconds
  private static readonly SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
  private static readonly LONG_BREAK_DURATION = 15 * 60; // 15 minutes

  private state: TimerState;
  private remainingTime: number;
  private intervalId?: NodeJS.Timeout;
  private completedPomodoros: number;
  private taskId?: string;
  private onTick?: (remainingTime: number) => void;
  private onComplete?: () => void;

  constructor() {
    this.state = TimerState.IDLE;
    this.remainingTime = Timer.POMODORO_DURATION;
    this.completedPomodoros = 0;
  }

  public start(
    taskId?: string,
    onTick?: (remainingTime: number) => void,
    onComplete?: () => void
  ): void {
    if (this.state === TimerState.RUNNING) return;

    this.taskId = taskId;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.state = TimerState.RUNNING;

    this.intervalId = setInterval(() => {
      this.remainingTime--;
      this.onTick?.(this.remainingTime);

      if (this.remainingTime <= 0) {
        this.complete();
      }
    }, 1000);
  }

  public pause(): void {
    if (this.state !== TimerState.RUNNING) return;

    clearInterval(this.intervalId);
    this.state = TimerState.PAUSED;
  }

  public resume(): void {
    if (this.state !== TimerState.PAUSED) return;
    this.start(this.taskId, this.onTick, this.onComplete);
  }

  public reset(): void {
    clearInterval(this.intervalId);
    this.state = TimerState.IDLE;
    this.remainingTime = Timer.POMODORO_DURATION;
    this.taskId = undefined;
  }

  private complete(): void {
    clearInterval(this.intervalId);
    this.completedPomodoros++;
    
    if (this.completedPomodoros % 4 === 0) {
      this.startLongBreak();
    } else {
      this.startShortBreak();
    }

    this.onComplete?.();
  }

  private startShortBreak(): void {
    this.state = TimerState.BREAK;
    this.remainingTime = Timer.SHORT_BREAK_DURATION;
  }

  private startLongBreak(): void {
    this.state = TimerState.BREAK;
    this.remainingTime = Timer.LONG_BREAK_DURATION;
  }

  // Getters
  public getState(): TimerState {
    return this.state;
  }

  public getRemainingTime(): number {
    return this.remainingTime;
  }

  public getCompletedPomodoros(): number {
    return this.completedPomodoros;
  }

  public getTaskId(): string | undefined {
    return this.taskId;
  }

  // Formatting utilities
  public static formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}