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
  1: [ // ორშაბათი (6 გაკვეთილი)
    { subject: 'მათემატიკა', teacher: 'ხუციშვილი' },
    { subject: 'გეოგრაფია', teacher: 'ნიკურაძე' },
    { subject: 'მოქალაქეობა', teacher: 'გიორგაძე' },
    { subject: 'საქართველოს ისტორია', teacher: 'ღონღაძე' },
    { subject: 'ქართული ენა', teacher: 'მდივანი' },
    { subject: 'სპორტი', teacher: 'ალანია' },
  ],
  2: [ // სამშაბათი (6 გაკვეთილი)
    { subject: 'ინგლისური', teacher: 'ბექანიშვილი' },
    { subject: 'ქართული ენა', teacher: 'მდივანი' },
    { subject: 'მათემატიკა', teacher: 'ხუციშვილი' },
    { subject: 'ფიზიკა', teacher: 'დვალიშვილი' },
    { subject: 'ქიმია', teacher: 'ბაღდავაძე' },
    { subject: 'ისტორია', teacher: 'ღონღაძე' },
  ],
  3: [ // ოთხშაბათი (5 გაკვეთილი)
    { subject: 'საქართველოს ისტორია', teacher: 'ღონღაძე' },
    { subject: 'ქართული ენა', teacher: 'მდივანი' },
    { subject: 'გეოგრაფია', teacher: 'ნიკურაძე' },
    { subject: 'რუსული / გერმანული', teacher: 'ობოლ. / ნადარ.' },
    { subject: 'პროექტი - მოქალაქეობა', teacher: 'ტატაევი' },
  ],
  4: [ // ხუთშაბათი (6 გაკვეთილი)
    { subject: 'მათემატიკა', teacher: 'ხუციშვილი' },
    { subject: 'ბიოლოგია', teacher: 'ნიკოლაიშვილი' },
    { subject: 'პროექტი მუსიკა', teacher: 'ჯაში' },
    { subject: 'ქართული ენა', teacher: 'მდივანი' },
    { subject: 'გეოგრაფია', teacher: 'ნიკურაძე' },
    { subject: 'ინგლისური', teacher: 'ბექანიშვილი' },
  ],
  5: [ // პარასკევი (5 გაკვეთილი)
    { subject: 'ისტორია', teacher: 'ღონღაძე' },
    { subject: 'ქართული ენა', teacher: 'მდივანი' },
    { subject: 'მათემატიკა', teacher: 'ხუციშვილი' },
    { subject: 'ბიოლოგია', teacher: 'ნიკოლაიშვილი' },
    { subject: 'რუსული / გერმანული', teacher: 'ობოლ. / ნადარ.' },
  ],
};

export const WEEKDAYS_GE = ["კვირა", "ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი"];

export interface HolidayItem {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  name: string;
  category: 'holiday' | 'break';
  weekdayName: string; // e.g. "ოთხშაბათი" or "16 დღე"
  dateLabel: string;   // e.g. "14 ოქტომბერი" or "30 დეკ. – 14 იან."
  details: string;
}

// Official Holidays & School Breaks for 2026-2027 Academic Year (excluding regular weekends)
export const OFFICIAL_HOLIDAYS_LIST: HolidayItem[] = [
  {
    id: 'svetitskhovloba',
    startDate: '2026-10-14',
    endDate: '2026-10-14',
    name: 'მცხეთობა / სვეტიცხოვლობა',
    category: 'holiday',
    weekdayName: 'ოთხშაბათი',
    dateLabel: '14 ოქტომბერი 2026',
    details: 'სვეტიცხოვლობის სახალხო დღესასწაული',
  },
  {
    id: 'giorgoba',
    startDate: '2026-11-23',
    endDate: '2026-11-23',
    name: 'გიორგობა',
    category: 'holiday',
    weekdayName: 'ორშაბათი',
    dateLabel: '23 ნოემბერი 2026',
    details: 'წმინდა გიორგის ხსენების დღე',
  },
  {
    id: 'winter-break',
    startDate: '2026-12-30',
    endDate: '2027-01-14',
    name: 'ზამთრის არდადეგები',
    category: 'break',
    weekdayName: '16 დღე',
    dateLabel: '30 დეკემბერი – 14 იანვარი',
    details: 'ახალი წელი (1–2 იანვარი) და შობა (7 იანვარი)',
  },
  {
    id: 'natlisgeba',
    startDate: '2027-01-19',
    endDate: '2027-01-19',
    name: 'ნათლისღება',
    category: 'holiday',
    weekdayName: 'სამშაბათი',
    dateLabel: '19 იანვარი 2027',
    details: 'უფლის ნათლისღების დღესასწაული',
  },
  {
    id: 'mothers-day',
    startDate: '2027-03-03',
    endDate: '2027-03-03',
    name: 'დედის დღე',
    category: 'holiday',
    weekdayName: 'ოთხშაბათი',
    dateLabel: '3 მარტი 2027',
    details: 'დედის დღის ოფიციალური დასვენება',
  },
  {
    id: 'spring-break',
    startDate: '2027-03-08',
    endDate: '2027-03-14',
    name: 'საგაზაფხულო არდადეგები',
    category: 'break',
    weekdayName: '7 დღე',
    dateLabel: '8 მარტი – 14 მარტი',
    details: 'ქალთა საერთაშორისო დღე (8 მარტი)',
  },
  {
    id: 'april-9',
    startDate: '2027-04-09',
    endDate: '2027-04-09',
    name: '9 აპრილი',
    category: 'holiday',
    weekdayName: 'პარასკევი',
    dateLabel: '9 აპრილი 2027',
    details: 'ეროვნული ერთიანობისა და დამოუკიდებლობის დღე',
  },
  {
    id: 'easter-break',
    startDate: '2027-04-30',
    endDate: '2027-05-03',
    name: 'სააღდგომო არდადეგები',
    category: 'break',
    weekdayName: '4 დღე',
    dateLabel: '30 აპრილი – 3 მაისი',
    details: 'დიდი პარასკევი, დიდი შაბათი, აღდგომა, მიცვალებულთა ხსენება',
  },
  {
    id: 'victory-day',
    startDate: '2027-05-09',
    endDate: '2027-05-09',
    name: 'ფაშიზმზე გამარჯვების დღე',
    category: 'holiday',
    weekdayName: 'კვირა',
    dateLabel: '9 მაისი 2027',
    details: 'ფაშიზმზე გამარჯვების დღე',
  },
  {
    id: 'standrew',
    startDate: '2027-05-12',
    endDate: '2027-05-12',
    name: 'წმინდა ანდრია მოციქულის დღე',
    category: 'holiday',
    weekdayName: 'ოთხშაბათი',
    dateLabel: '12 მაისი 2027',
    details: 'წმინდა ანდრია პირველწოდებულის ხსენების დღე',
  },
  {
    id: 'family-day',
    startDate: '2027-05-17',
    endDate: '2027-05-17',
    name: 'ოჯახის სიწმინდის დღე',
    category: 'holiday',
    weekdayName: 'ორშაბათი',
    dateLabel: '17 მაისი 2027',
    details: 'ოჯახის სიწმინდისა და მშობლების პატივისცემის დღე',
  },
  {
    id: 'independence-day',
    startDate: '2027-05-26',
    endDate: '2027-05-26',
    name: 'საქართველოს დამოუკიდებლობის დღე',
    category: 'holiday',
    weekdayName: 'ოთხშაბათი',
    dateLabel: '26 მაისი 2027',
    details: 'საქართველოს სახელმწიფოებრივი დამოუკიდებლობის დღე',
  },
];

export const checkIsHolidayDate = (year: number, month: number, day: number): boolean => {
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  for (const h of OFFICIAL_HOLIDAYS_LIST) {
    if (dateStr >= h.startDate && dateStr <= h.endDate) {
      return true;
    }
  }
  // Summer break definition (June 15 - Sept 14)
  if ((month === 6 && day >= 15) || month === 7 || month === 8 || (month === 9 && day <= 14)) {
    return true;
  }
  return false;
};

export const getHolidayNameForDate = (year: number, month: number, day: number): string => {
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  for (const h of OFFICIAL_HOLIDAYS_LIST) {
    if (dateStr >= h.startDate && dateStr <= h.endDate) {
      return h.name;
    }
  }
  if ((month === 6 && day >= 15) || month === 7 || month === 8 || (month === 9 && day <= 14)) {
    return 'საზაფხულო არდადეგები';
  }
  return 'დასვენება';
};
