
import { BellTime, DailySchedule } from './types';

export const BELL_TIMES: BellTime[] = [
  { period: 1, start: '08:30', end: '09:10' },
  { period: 2, start: '09:15', end: '09:55' },
  { period: 3, start: '10:05', end: '10:45' },
  { period: 4, start: '10:55', end: '11:35' },
  { period: 5, start: '11:40', end: '12:20' },
  { period: 6, start: '12:25', end: '13:05' },
  { period: 7, start: '13:10', end: '13:50' },
];

export const LESSON_SCHEDULE: DailySchedule = {
  1: [ // ორშაბათი
    { subject: 'სპორტი', teacher: 'გ. ალადაშვილი' },
    { subject: 'გეოგრაფია', teacher: 'ნიკურაძე' },
    { subject: 'რუსულ/გერმ', teacher: 'ობოლ/ნადირ' },
    { subject: 'ქართ. ენა და ლიტ', teacher: 'მდივანი' },
    { subject: 'მათემატიკა', teacher: 'ხუციშვილი' },
    { subject: 'ისტორია', teacher: 'დონდაძე' },
    { subject: 'კომპიუტ. მეცნიერ.', teacher: 'აბულაძე' },
  ],
  2: [ // სამშაბათი
    { subject: 'მათემატიკა', teacher: 'ხუციშვილი' },
    { subject: 'საქართ. ისტორია', teacher: 'დონდაძე' },
    { subject: 'ქიმია', teacher: 'მ. ბადუაშვილი' },
    { subject: 'ბიოლოგია', teacher: 'დურგლიშვილი' },
    { subject: 'ქართ. ენა და ლიტ', teacher: 'მდივანი' },
    { subject: 'ინგლისური', teacher: 'ი. იაკობაშვილი' },
  ],
  3: [ // ოთხშაბათი
    { subject: 'კომპიუტ. მეცნიერ.', teacher: 'აბულაძე' },
    { subject: 'მათემატიკა', teacher: 'ხუციშვილი' },
    { subject: 'ქართ. ენა და ლიტ', teacher: 'მდივანი' },
    { subject: 'სპორტი', teacher: 'გ. ალადაშვილი' },
    { subject: 'მოქალაქეობა', teacher: 'ნ. გიორგაძე' },
    { subject: 'ისტორია', teacher: 'დონდაძე' },
  ],
  4: [ // ხუთშაბათი
    { subject: 'გეოგრაფია', teacher: 'ნიკურაძე' },
    { subject: 'ქიმია', teacher: 'მ. ბადუაშვილი' },
    { subject: 'მათემატიკა', teacher: 'ხუციშვილი' },
    { subject: 'ქართ. ენა და ლიტ', teacher: 'მდივანი' },
    { subject: 'ინგლისური', teacher: 'ი. იაკობაშვილი' },
    { subject: 'საქართ. ისტორია', teacher: 'დონდაძე' },
  ],
  5: [ // პარასკევი
    { subject: 'ბიოლოგია', teacher: 'დურგლიშვილი' }, // Swapped from index 3
    { subject: 'მათემატიკა', teacher: 'ხუციშვილი' },
    { subject: 'ქართ. ენა და ლიტ', teacher: 'მდივანი' },
    { subject: 'სახ. და გამ. ხელ.', teacher: 'ენდელაძე' }, // Swapped from index 0
    { subject: 'ფიზიკა', teacher: 'მ. დვალი' },
    { subject: 'პროექტ. მოქალაქ.', teacher: 'ტატაევი' },
    { subject: 'რუსულ/გერმ', teacher: 'ობოლ/ნადირ' },
  ],
};

export const WEEKDAYS_GE = ["კვირა", "ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი"];

// Holidays in 2026 (Month-Day)
export const HOLIDAYS_2026 = [
  "01-01", "01-02", "01-05", "01-06", "01-07", "01-19", // Jan
  "03-03", "03-08", // Mar
  "04-09", "04-10", "04-11", "04-12", "04-13", // Apr
  "05-09", "05-12", "05-17", "05-26", // May
  "08-28", // Aug
  "10-14", // Oct
  "23-11", // Nov
];
