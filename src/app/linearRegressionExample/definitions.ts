export interface IChip {
  xValue: number;
  yValue: number;
}

export interface IScriptPerformance {
  start?: number;
  end?: number;
  timeElapsed?: string;
}

export enum LearningStatus {
  PROGRESS,
  DONE
}
