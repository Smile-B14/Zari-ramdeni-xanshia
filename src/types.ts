
export interface BellTime {
  period: number;
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

export interface Lesson {
  subject: string;
  teacher?: string;
}

export interface DailySchedule {
  [day: number]: Lesson[]; // 1-5 for Mon-Fri
}

export enum BellStatus {
  LESSON = 'LESSON',
  BREAK = 'BREAK',
  BEFORE_SCHOOL = 'BEFORE_SCHOOL',
  AFTER_SCHOOL = 'AFTER_SCHOOL',
  WEEKEND = 'WEEKEND'
}
