import { Calendar, Clock, Coffee, GraduationCap, Moon, PartyPopper, Sun, ExternalLink, BookOpenCheck, Flag, Volume2, VolumeX, Vibrate, VibrateOff, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { 
  BELL_TIMES, 
  LESSON_SCHEDULE, 
  WEEKDAYS_GE, 
  OFFICIAL_HOLIDAYS_LIST, 
  HolidayItem,
  checkIsHolidayDate, 
  getHolidayNameForDate 
} from './constants';
import { BellStatus } from './types';

const BELL_DELAY_SECONDS = 80; // 1 min 20 sec 
const MONTH_NAMES_GE = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"
];

const formatTimeRemaining = (seconds: number | null) => {
  if (seconds === null) return null;
  const s = Math.max(0, Math.ceil(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getColorConfig = (color: string, isDark: boolean) => {
  const map: Record<string, any> = {
    blue: {
      shape1: isDark ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.12)',
      shape2: isDark ? 'rgba(96,165,250,0.2)' : 'rgba(96,165,250,0.1)',
      text: isDark ? 'text-blue-300' : 'text-blue-600',
      bg: 'bg-blue-500',
      bgSubtle: isDark ? 'bg-blue-500/15' : 'bg-blue-50',
      border: isDark ? 'border-blue-500/30' : 'border-blue-200',
      selection: 'selection:bg-blue-500 selection:text-white',
      buttonActive: isDark 
        ? 'bg-blue-600 text-white shadow-[0_4px_20px_rgba(59,130,246,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] border-blue-400/40' 
        : 'bg-blue-600 text-white shadow-[0_4px_20px_rgba(59,130,246,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)] border-blue-500',
      ring: 'ring-blue-500/50',
      hexColor: '#3b82f6',
      glowColor: 'rgba(59,130,246,0.6)',
      ringGradStart: '#60a5fa',
      ringGradEnd: '#2563eb',
      badge: isDark 
        ? 'bg-blue-500/15 text-blue-300 border border-blue-400/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
        : 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm',
    },
    emerald: {
      shape1: isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.12)',
      shape2: isDark ? 'rgba(52,211,153,0.2)' : 'rgba(52,211,153,0.1)',
      text: isDark ? 'text-emerald-300' : 'text-emerald-600',
      bg: 'bg-emerald-500',
      bgSubtle: isDark ? 'bg-emerald-500/15' : 'bg-emerald-50',
      border: isDark ? 'border-emerald-500/30' : 'border-emerald-200',
      selection: 'selection:bg-emerald-500 selection:text-white',
      buttonActive: isDark 
        ? 'bg-emerald-600 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] border-emerald-400/40' 
        : 'bg-emerald-600 text-white shadow-[0_4px_20px_rgba(16,185,129,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)] border-emerald-500',
      ring: 'ring-emerald-500/50',
      hexColor: '#10b981',
      glowColor: 'rgba(16,185,129,0.6)',
      ringGradStart: '#34d399',
      ringGradEnd: '#059669',
      badge: isDark 
        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm',
    },
    amber: {
      shape1: isDark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.12)',
      shape2: isDark ? 'rgba(251,191,36,0.2)' : 'rgba(251,191,36,0.1)',
      text: isDark ? 'text-amber-300' : 'text-amber-600',
      bg: 'bg-amber-500',
      bgSubtle: isDark ? 'bg-amber-500/15' : 'bg-amber-50',
      border: isDark ? 'border-amber-500/30' : 'border-amber-200',
      selection: 'selection:bg-amber-500 selection:text-white',
      buttonActive: isDark 
        ? 'bg-amber-600 text-white shadow-[0_4px_20px_rgba(245,158,11,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] border-amber-400/40' 
        : 'bg-amber-600 text-white shadow-[0_4px_20px_rgba(245,158,11,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)] border-amber-500',
      ring: 'ring-amber-500/50',
      hexColor: '#f59e0b',
      glowColor: 'rgba(245,158,11,0.6)',
      ringGradStart: '#fbbf24',
      ringGradEnd: '#d97706',
      badge: isDark 
        ? 'bg-amber-500/15 text-amber-300 border border-amber-400/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
        : 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm',
    },
    slate: {
      shape1: isDark ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.1)',
      shape2: isDark ? 'rgba(100,116,139,0.12)' : 'rgba(100,116,139,0.08)',
      text: isDark ? 'text-slate-300' : 'text-slate-600',
      bg: 'bg-slate-500',
      bgSubtle: isDark ? 'bg-white/5' : 'bg-slate-100',
      border: isDark ? 'border-white/10' : 'border-slate-200',
      selection: 'selection:bg-slate-500 selection:text-white',
      buttonActive: isDark 
        ? 'bg-slate-700 text-white shadow-[0_4px_20px_rgba(100,116,139,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] border-slate-500/40' 
        : 'bg-slate-800 text-white shadow-[0_4px_20px_rgba(100,116,139,0.2),inset_0_1px_1px_rgba(255,255,255,0.3)] border-slate-700',
      ring: 'ring-slate-500/50',
      hexColor: '#64748b',
      glowColor: 'rgba(100,116,139,0.4)',
      ringGradStart: '#94a3b8',
      ringGradEnd: '#475569',
      badge: isDark 
        ? 'bg-white/10 text-slate-300 border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
        : 'bg-white/80 text-slate-600 border border-slate-200 shadow-sm',
    }
  };
  return map[color];
};

const tzFormatter = new Intl.DateTimeFormat('en-US', { 
  timeZone: 'Asia/Tbilisi', 
  hour12: false, 
  year: 'numeric', 
  month: '2-digit', 
  day: '2-digit', 
  hour: '2-digit', 
  minute: '2-digit', 
  second: '2-digit' 
});

const App: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date().getDay();
    return today >= 1 && today <= 5 ? today : 1;
  });
  const [holidayFilter, setHolidayFilter] = useState<'all' | 'break' | 'holiday'>('all');

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('bell_sound_enabled');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [vibrationEnabled, setVibrationEnabled] = useState(() => {
    const saved = localStorage.getItem('bell_vibration_enabled');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('bell_sound_enabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('bell_vibration_enabled', JSON.stringify(vibrationEnabled));
  }, [vibrationEnabled]);

  // High performance timer: 1-second interval eliminates unnecessary re-renders
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const tbilisiTimeData = useMemo(() => {
    const parts = tzFormatter.formatToParts(now);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
    const year = parseInt(getPart('year'), 10) || 2026;
    const month = getPart('month');
    const date = getPart('day');
    const hour = parseInt(getPart('hour'), 10) || 0;
    const minute = parseInt(getPart('minute'), 10) || 0;
    const second = parseInt(getPart('second'), 10) || 0;
    const tbilisiNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tbilisi' }));
    return { 
      day: tbilisiNow.getDay(), 
      m: parseInt(month, 10), 
      d: parseInt(date, 10), 
      hour, 
      minute, 
      second, 
      year, 
      raw: tbilisiNow 
    };
  }, [now]);

  const { 
    status, 
    nextBellIn, 
    delayIn, 
    currentPeriod, 
    nextEventLabel, 
    nextSchoolDay, 
    showTimer, 
    totalDuration, 
    holidayNameToday 
  } = useMemo(() => {
    const { day, m, d, hour, minute, second, raw, year } = tbilisiTimeData;
    const isHoliday = checkIsHolidayDate(year, m, d);
    let holidayNameToday = null;
    if (isHoliday) {
      holidayNameToday = getHolidayNameForDate(year, m, d);
    } else if (day === 0 || day === 6) {
      holidayNameToday = "შაბათ-კვირა";
    }
    
    const getNextSchoolStartTime = () => {
      let nextDate = new Date(raw);
      nextDate.setHours(8, 30, 0, 0);
      let found = false;
      let daysAdded = 0;
      while (!found) {
        nextDate.setDate(nextDate.getDate() + 1);
        daysAdded++;
        const ny = nextDate.getFullYear();
        const nm = nextDate.getMonth() + 1;
        const nd = nextDate.getDate();
        const nDay = nextDate.getDay();
        if (nDay !== 0 && nDay !== 6 && !checkIsHolidayDate(ny, nm, nd)) {
          found = true;
        }
      }
      return { time: nextDate, day: nextDate.getDay(), daysAdded };
    };

    const currentTimeInSeconds = hour * 3600 + minute * 60 + second;
    const firstStart = BELL_TIMES[0].start.split(':').map(Number);
    const startOfDaySecs = firstStart[0] * 3600 + firstStart[1] * 60;
    
    // Determine the last lesson for TODAY specifically
    const todaySchedule = LESSON_SCHEDULE[day] || [];
    const lastLessonIndex = todaySchedule.length > 0 ? todaySchedule.length - 1 : BELL_TIMES.length - 1;
    const lastEnd = BELL_TIMES[lastLessonIndex].end.split(':').map(Number);
    const endOfDaySecs = lastEnd[0] * 3600 + lastEnd[1] * 60;

    // School is closed logic (Weekend, Holiday, or After Last Lesson)
    if (day === 0 || day === 6 || isHoliday || currentTimeInSeconds > endOfDaySecs + BELL_DELAY_SECONDS) {
      const nextInfo = getNextSchoolStartTime();
      let label = 'სკოლის დაწყებამდე';
      if (nextInfo.daysAdded === 1) {
        label = 'ხვალამდე';
      } else {
        const names = ["კვირამდე", "ორშაბათამდე", "სამშაბათამდე", "ოთხშაბათამდე", "ხუთშაბათამდე", "პარასკევამდე", "შაბათამდე"];
        label = names[nextInfo.day];
      }

      return { 
        status: (day === 0 || day === 6 || isHoliday) ? BellStatus.WEEKEND : BellStatus.AFTER_SCHOOL, 
        nextBellIn: null,
        delayIn: null, 
        totalDuration: null,
        currentPeriod: 0, 
        nextEventLabel: label,
        nextSchoolDay: nextInfo.day,
        showTimer: false,
        holidayNameToday
      };
    }

    // Before school today (from 00:00 to 08:30)
    if (currentTimeInSeconds < startOfDaySecs) {
      return { 
        status: BellStatus.BEFORE_SCHOOL, 
        nextBellIn: startOfDaySecs - currentTimeInSeconds, 
        delayIn: null, 
        totalDuration: startOfDaySecs,
        currentPeriod: 0, 
        nextEventLabel: 'გაკვეთილების დაწყებამდე',
        nextSchoolDay: day,
        showTimer: true,
        holidayNameToday
      };
    }

    // Ongoing school day
    for (let i = 0; i < todaySchedule.length; i++) {
      const b = BELL_TIMES[i];
      const s = b.start.split(':').map(Number);
      const e = b.end.split(':').map(Number);
      const sSecs = s[0] * 3600 + s[1] * 60;
      const eSecs = e[0] * 3600 + e[1] * 60;
      
      if (currentTimeInSeconds >= sSecs && currentTimeInSeconds < eSecs) {
        return { 
          status: BellStatus.LESSON, 
          nextBellIn: eSecs - currentTimeInSeconds, 
          delayIn: null, 
          totalDuration: eSecs - sSecs, 
          currentPeriod: i + 1, 
          nextEventLabel: 'გაკვეთილის დასრულებამდე', 
          nextSchoolDay: day,
          showTimer: true, 
          holidayNameToday 
        };
      }
      if (currentTimeInSeconds >= eSecs && currentTimeInSeconds < eSecs + BELL_DELAY_SECONDS) {
        return { 
          status: BellStatus.LESSON, 
          nextBellIn: 0, 
          delayIn: (eSecs + BELL_DELAY_SECONDS) - currentTimeInSeconds, 
          totalDuration: BELL_DELAY_SECONDS, 
          currentPeriod: i + 1, 
          nextEventLabel: 'ზარის მოლოდინი (დაგვიანება)', 
          nextSchoolDay: day,
          showTimer: true, 
          holidayNameToday 
        };
      }
      if (i < todaySchedule.length - 1) {
        const nextStart = BELL_TIMES[i + 1].start.split(':').map(Number);
        const nsSecs = nextStart[0] * 3600 + nextStart[1] * 60;
        if (currentTimeInSeconds >= eSecs + BELL_DELAY_SECONDS && currentTimeInSeconds < nsSecs) {
          return { 
            status: BellStatus.BREAK, 
            nextBellIn: nsSecs - currentTimeInSeconds, 
            delayIn: null, 
            totalDuration: nsSecs - (eSecs + BELL_DELAY_SECONDS), 
            currentPeriod: i + 1, 
            nextEventLabel: 'დასვენების დასრულებამდე', 
            nextSchoolDay: day,
            showTimer: true, 
            holidayNameToday 
          };
        }
        if (currentTimeInSeconds >= nsSecs && currentTimeInSeconds < nsSecs + BELL_DELAY_SECONDS) {
          return { 
            status: BellStatus.BREAK, 
            nextBellIn: 0, 
            delayIn: (nsSecs + BELL_DELAY_SECONDS) - currentTimeInSeconds, 
            totalDuration: BELL_DELAY_SECONDS, 
            currentPeriod: i + 1, 
            nextEventLabel: 'ზარის მოლოდინი (დაწყება)', 
            nextSchoolDay: day,
            showTimer: true, 
            holidayNameToday 
          };
        }
      }
    }

    return { 
      status: BellStatus.AFTER_SCHOOL, 
      nextBellIn: null, 
      delayIn: null, 
      totalDuration: null, 
      currentPeriod: 0, 
      nextEventLabel: 'დასრულდა', 
      nextSchoolDay: (day >= 5 || day === 0) ? 1 : day + 1,
      showTimer: false, 
      holidayNameToday 
    };
  }, [tbilisiTimeData]);

  const isLongCountdown = status === BellStatus.BEFORE_SCHOOL || status === BellStatus.AFTER_SCHOOL || status === BellStatus.WEEKEND;

  // Percentage calculated accurately: 0 to 100
  const timerProgressPercent = (showTimer && totalDuration && totalDuration > 0) 
    ? Math.max(0, Math.min(100, (1 - ((delayIn !== null ? delayIn : (nextBellIn || 0)) / totalDuration)) * 100))
    : 0;

  // Next lesson or Tomorrow Holiday display
  const lessonData = useMemo(() => {
    const isOut = status === BellStatus.AFTER_SCHOOL || status === BellStatus.WEEKEND;
    const { raw, day } = tbilisiTimeData;
    
    // Check if tomorrow is a holiday or weekend
    const tmDate = new Date(raw);
    tmDate.setDate(tmDate.getDate() + 1);
    const tmYear = tmDate.getFullYear();
    const tmMonth = tmDate.getMonth() + 1;
    const tmDayNum = tmDate.getDate();
    const tmDayOfWeek = tmDate.getDay();
    const isTomorrowHoliday = checkIsHolidayDate(tmYear, tmMonth, tmDayNum);
    const isTomorrowWeekend = tmDayOfWeek === 0 || tmDayOfWeek === 6;

    let tomorrowHolidayName: string | null = null;
    if (isTomorrowHoliday) {
      tomorrowHolidayName = getHolidayNameForDate(tmYear, tmMonth, tmDayNum);
    } else if (isTomorrowWeekend && day !== 6) {
      tomorrowHolidayName = "შაბათ-კვირა";
    }

    const targetDay = isOut ? (nextSchoolDay || 1) : day;
    const daySchedule = LESSON_SCHEDULE[targetDay] || [];
    if (daySchedule.length === 0) return null;

    if (isOut) {
      // If tomorrow is holiday or weekend, highlight that tomorrow is off!
      if (tomorrowHolidayName) {
        const nextDayName = WEEKDAYS_GE[targetDay];
        return {
          isTomorrowOff: true,
          tomorrowHolidayName,
          nextSchoolLabel: `${nextDayName}ს`,
          firstLesson: daySchedule[0],
          secondLesson: daySchedule[1] || null
        };
      }

      // Tomorrow is a normal school day
      return { 
        isTomorrowOff: false,
        current: { label: 'ხვალ', lesson: daySchedule[0], num: 1, isLast: daySchedule.length === 1 }, 
        next: daySchedule[1] ? { ...daySchedule[1], num: 2, isNextLast: daySchedule.length === 2 } : null 
      };
    }

    if (status === BellStatus.BEFORE_SCHOOL) {
      return { 
        isTomorrowOff: false,
        current: { label: 'პირველი გაკვეთილი', lesson: daySchedule[0], num: 1, isLast: daySchedule.length === 1 }, 
        next: daySchedule[1] ? { ...daySchedule[1], num: 2, isNextLast: daySchedule.length === 2 } : null 
      };
    }
    
    if (status === BellStatus.LESSON) {
      const isLast = currentPeriod === daySchedule.length;
      const next = daySchedule[currentPeriod];
      return { 
        isTomorrowOff: false,
        current: { label: 'ახლა გვაქვს', lesson: daySchedule[currentPeriod - 1], num: currentPeriod, isLast }, 
        next: next ? { ...next, num: currentPeriod + 1, isNextLast: currentPeriod + 1 === daySchedule.length } : null 
      };
    }
    
    if (status === BellStatus.BREAK) {
      const next = daySchedule[currentPeriod];
      const following = daySchedule[currentPeriod + 1];
      const isNextLast = currentPeriod + 1 === daySchedule.length;
      return next ? { 
        isTomorrowOff: false,
        current: { label: 'შემდეგი გაკვეთილი', lesson: next, num: currentPeriod + 1, isLast: isNextLast }, 
        next: following ? { ...following, num: currentPeriod + 2, isNextLast: currentPeriod + 2 === daySchedule.length } : null 
      } : null;
    }
    
    return null;
  }, [tbilisiTimeData, status, currentPeriod, nextSchoolDay]);

  // Quick current / active lesson time indicator (e.g. 08:30 – 09:10)
  const activeLessonTimeInfo = useMemo(() => {
    if (status === BellStatus.WEEKEND) return null;

    if (status === BellStatus.LESSON && currentPeriod >= 1 && currentPeriod <= BELL_TIMES.length) {
      const b = BELL_TIMES[currentPeriod - 1];
      return {
        range: `${b.start} – ${b.end}`,
        label: `${currentPeriod}-ლი გაკვეთილი`,
        period: currentPeriod
      };
    }

    if (status === BellStatus.BREAK && currentPeriod >= 1 && currentPeriod < BELL_TIMES.length) {
      const nextB = BELL_TIMES[currentPeriod];
      return {
        range: `${nextB.start} – ${nextB.end}`,
        label: `შემდეგი გაკვეთილი`,
        period: currentPeriod + 1
      };
    }

    if (status === BellStatus.BEFORE_SCHOOL) {
      const b = BELL_TIMES[0];
      return {
        range: `${b.start} – ${b.end}`,
        label: `1-ლი გაკვეთილი`,
        period: 1
      };
    }

    if (status === BellStatus.AFTER_SCHOOL) {
      const b = BELL_TIMES[0];
      return {
        range: `${b.start} – ${b.end}`,
        label: `1-ლი გაკვეთილი`,
        period: 1
      };
    }

    return null;
  }, [status, currentPeriod]);

  // Process and rank holidays for 2026-2027
  const { holidayStatusByDay, nextHolidayInfo, processedHolidays } = useMemo(() => {
    const { raw } = tbilisiTimeData;
    
    // Check which days of current week are holidays (Mon-Fri)
    const hStatus: Record<number, boolean> = {};
    const tempDate = new Date(raw);
    const currentDay = tempDate.getDay(); 
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    tempDate.setDate(tempDate.getDate() + diffToMonday);
    
    for (let i = 1; i <= 5; i++) {
      const d = new Date(tempDate);
      d.setDate(tempDate.getDate() + (i - 1));
      hStatus[i] = checkIsHolidayDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
    }

    let nearestHoliday: (HolidayItem & { daysRemaining: number; isOngoing: boolean }) | null = null;
    let minDays = Infinity;

    const processed = OFFICIAL_HOLIDAYS_LIST.map(h => {
      const [sy, sm, sd] = h.startDate.split('-').map(Number);
      const [ey, em, ed] = h.endDate.split('-').map(Number);
      
      const startDateTime = new Date(sy, sm - 1, sd, 0, 0, 0).getTime();
      const endDateTime = new Date(ey, em - 1, ed, 23, 59, 59).getTime();
      const nowTime = raw.getTime();

      const isOngoing = nowTime >= startDateTime && nowTime <= endDateTime;
      const isPast = nowTime > endDateTime;
      const daysRemaining = Math.ceil((startDateTime - nowTime) / (1000 * 60 * 60 * 24));

      if (!isPast && daysRemaining >= 0 && daysRemaining < minDays) {
        minDays = daysRemaining;
        nearestHoliday = {
          ...h,
          daysRemaining,
          isOngoing,
        };
      }

      return {
        ...h,
        isOngoing,
        isPast,
        daysRemaining: Math.max(0, daysRemaining),
      };
    });

    return { 
      holidayStatusByDay: hStatus, 
      nextHolidayInfo: nearestHoliday, 
      processedHolidays: processed 
    };
  }, [tbilisiTimeData]);

  const activeColor = delayIn !== null 
    ? 'amber' 
    : status === BellStatus.LESSON 
      ? 'blue' 
      : status === BellStatus.BREAK 
        ? 'emerald' 
        : 'slate';
  const activeTheme = getColorConfig(activeColor, isDarkMode);

  useEffect(() => {
    const bgColors = {
      dark: {
        blue: '#080d1a',
        emerald: '#09130e',
        amber: '#151108',
        slate: '#0d0e12',
      },
      light: {
        blue: '#f1f5fd',
        emerald: '#f0fdf6',
        amber: '#fefbf0',
        slate: '#f8f9fa',
      }
    };
    
    const bgColor = isDarkMode ? bgColors.dark[activeColor as keyof typeof bgColors.dark] : bgColors.light[activeColor as keyof typeof bgColors.light];
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
  }, [isDarkMode, activeColor]);

  // Glassmorphic design tokens
  const theme = {
    card: isDarkMode 
      ? 'bg-white/[0.035] backdrop-blur-[32px] border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)]' 
      : 'bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_12px_40px_rgba(31,38,135,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)]',
    sub: isDarkMode ? 'text-slate-300' : 'text-slate-500 font-semibold',
    head: isDarkMode ? 'text-white' : 'text-slate-900',
    muted: isDarkMode 
      ? 'bg-white/[0.025] border border-white/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]' 
      : 'bg-white/50 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]',
    border: isDarkMode ? 'border-white/[0.08]' : 'border-slate-300/40',
  };

  const prevStatusRef = useRef<{ delayIn: number | null }>({ delayIn: null });
  
  // Audio chime when bell delay begins
  useEffect(() => {
    if (delayIn !== null && prevStatusRef.current.delayIn === null) {
      if (soundEnabled) {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            const ctx = new AudioContext();
            const playTone = (freq: number, startTime: number) => {
              const osc = ctx.createOscillator();
              const gainNode = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
              gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
              gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startTime + 0.05);
              gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + 1.8);
              osc.connect(gainNode);
              gainNode.connect(ctx.destination);
              osc.start(ctx.currentTime + startTime);
              osc.stop(ctx.currentTime + startTime + 1.8);
            };
            playTone(880, 0);       // A5
            playTone(1108.73, 0.15); // C#6
          }
        } catch (e) {
          console.error("Audio chime playback failed", e);
        }
      }
      if (vibrationEnabled && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch (_) {}
      }
    }
    prevStatusRef.current = { delayIn };
  }, [delayIn, soundEnabled, vibrationEnabled]);

  const selectedLessons = LESSON_SCHEDULE[selectedDay] || [];
  const maxPeriod = selectedLessons.length;
  const lastLessonEndTime = maxPeriod > 0 ? BELL_TIMES[maxPeriod - 1].end : '13:05';

  const filteredHolidays = useMemo(() => {
    if (holidayFilter === 'all') return processedHolidays;
    return processedHolidays.filter(h => h.category === holidayFilter);
  }, [processedHolidays, holidayFilter]);

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${isDarkMode ? 'text-slate-100 selection:bg-blue-500/30' : 'text-slate-800 selection:bg-blue-500/20'}`}>
      
      {/* Hardware-accelerated glassy ambient light orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-1000"
          style={{ background: activeTheme.shape1 }}
        />
        <div 
          className="absolute top-[40%] -right-[15%] w-[650px] h-[650px] rounded-full blur-[160px] transition-all duration-1000"
          style={{ background: activeTheme.shape2 }}
        />
        <div 
          className="absolute -bottom-[20%] left-[25%] w-[500px] h-[500px] rounded-full blur-[130px] transition-all duration-1000"
          style={{ background: activeTheme.shape1 }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-start">
        
        {/* Top Control Bar */}
        <div className="xl:col-span-12 flex items-center justify-end w-full">
          {/* Audio, Vibration, Theme Toggles */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if ('vibrate' in navigator) {
                  try {
                    navigator.vibrate(50);
                  } catch (_) {}
                }
                setVibrationEnabled(!vibrationEnabled);
              }}
              className={`p-2.5 md:p-3 rounded-2xl transition-all border backdrop-blur-xl ${
                isDarkMode 
                  ? 'bg-white/[0.04] border-white/[0.12] text-slate-300 hover:text-white hover:bg-white/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.2)]' 
                  : 'bg-white/80 border-white text-slate-600 hover:text-slate-900 shadow-sm'
              } hover:-translate-y-0.5 active:scale-95`}
              title="ვიბრაციის ჩართვა/გამორთვა"
            >
              {vibrationEnabled ? <Vibrate size={18} /> : <VibrateOff size={18} className="opacity-40" />}
            </button>

            <button 
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) {
                  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                  if (AudioContext) {
                    const ctx = new AudioContext();
                    ctx.resume().catch(() => {});
                  }
                }
              }} 
              className={`p-2.5 md:p-3 rounded-2xl transition-all border backdrop-blur-xl ${
                isDarkMode 
                  ? 'bg-white/[0.04] border-white/[0.12] text-slate-300 hover:text-white hover:bg-white/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.2)]' 
                  : 'bg-white/80 border-white text-slate-600 hover:text-slate-900 shadow-sm'
              } hover:-translate-y-0.5 active:scale-95`}
              title="ზარის ხმის ჩართვა/გამორთვა"
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="opacity-40" />}
            </button>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className={`p-2.5 md:p-3 rounded-2xl transition-all border backdrop-blur-xl ${
                isDarkMode 
                  ? 'bg-white/[0.04] border-white/[0.12] text-amber-300 hover:bg-white/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.2)]' 
                  : 'bg-white/80 border-white text-amber-600 hover:bg-white shadow-sm'
              } hover:-translate-y-0.5 active:scale-95`}
              title="თემის შეცვლა"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Centered Hero Section Header */}
        <header className="xl:col-span-12 flex flex-col items-center justify-center text-center gap-2.5 mt-1">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-center ${theme.head}`}>
            ზარი რამდენ ხანშია?
          </h1>

          <div className={`px-5 py-2 rounded-full border backdrop-blur-xl flex items-center gap-2.5 ${isDarkMode ? 'bg-white/[0.04] border-white/[0.1]' : 'bg-white/70 border-white/60 shadow-sm'}`}>
            <Calendar size={15} className={activeTheme.text} />
            <span className="text-xs sm:text-sm font-bold">
              {tbilisiTimeData.d} {MONTH_NAMES_GE[tbilisiTimeData.m - 1]} • {WEEKDAYS_GE[tbilisiTimeData.day]}, {tbilisiTimeData.hour.toString().padStart(2, '0')}:{tbilisiTimeData.minute.toString().padStart(2, '0')}
            </span>
          </div>
        </header>

        {/* Main Countdown Column (Left on desktop) */}
        <div className="w-full xl:col-span-7 flex flex-col gap-6">
          
          <main className={`w-full rounded-3xl sm:rounded-[2.5rem] lg:rounded-[3rem] p-5 sm:p-7 md:p-10 lg:p-12 text-center relative overflow-hidden transition-all duration-500 flex flex-col justify-between min-h-[440px] sm:min-h-[480px] ${theme.card}`}>
            
            {/* Ambient background glow accent */}
            <div 
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 sm:w-96 h-64 sm:h-96 rounded-full blur-3xl opacity-15 sm:opacity-20 pointer-events-none transition-all duration-700"
              style={{ backgroundColor: activeTheme.hexColor }}
            />

            {/* Buttery smooth hardware-accelerated progress ring around card */}
            {totalDuration && showTimer && (
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none rounded-[inherit] overflow-visible z-0"
              >
                <defs>
                  <linearGradient id="ring-glow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={activeTheme.ringGradStart} />
                    <stop offset="100%" stopColor={activeTheme.ringGradEnd} />
                  </linearGradient>
                  <filter id="smooth-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Background track */}
                <rect 
                  x="3" 
                  y="3" 
                  width="calc(100% - 6px)" 
                  height="calc(100% - 6px)" 
                  rx="36" 
                  fill="none" 
                  stroke={isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'} 
                  strokeWidth="3.5" 
                />

                {/* Animated active stroke */}
                <rect 
                  x="3" 
                  y="3" 
                  width="calc(100% - 6px)" 
                  height="calc(100% - 6px)" 
                  rx="36" 
                  fill="none" 
                  stroke="url(#ring-glow-gradient)" 
                  strokeWidth="3.5" 
                  pathLength="100" 
                  strokeDasharray="100" 
                  strokeDashoffset={100 - timerProgressPercent} 
                  strokeLinecap="round" 
                  filter="url(#smooth-glow)"
                  style={{ 
                    transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
                  }} 
                />
              </svg>
            )}

            {/* Specular glass reflection */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
            
            <div className="flex flex-col items-center justify-between w-full h-full relative z-10 my-auto">
              
              {/* Top Header Row within Card: Status Pill & Time Range */}
              <div className="w-full flex items-center justify-between gap-2 mb-4 sm:mb-6">
                <div className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-2 uppercase tracking-[0.14em] transition-all shadow-sm ${activeTheme.badge}`}>
                  <span className={`w-2 h-2 rounded-full ${activeTheme.bg} animate-pulse`} />
                  {status === BellStatus.LESSON ? (
                    <GraduationCap size={14} className="shrink-0" />
                  ) : status === BellStatus.BREAK ? (
                    <Coffee size={14} className="shrink-0" />
                  ) : (
                    <Flag size={14} className="shrink-0" />
                  )}
                  <span className="truncate">{nextEventLabel}</span>
                </div>

                {activeLessonTimeInfo && (
                  <div className={`hidden sm:inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all shadow-sm ${isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-slate-300' : 'bg-white/80 border-slate-200/80 text-slate-700'}`}>
                    <Clock size={13} className={activeTheme.text} />
                    <span>{activeLessonTimeInfo.range}</span>
                  </div>
                )}
              </div>
            
              {/* Central Hero Countdown */}
              <div className="w-full flex flex-col items-center justify-center my-3 sm:my-6">
                {showTimer ? (
                  <>
                    <div className={`text-[3.25rem] xs:text-[4.2rem] sm:text-6xl md:text-7xl lg:text-[7.5rem] xl:text-[8.25rem] font-black tabular-nums tracking-tighter leading-none select-none drop-shadow-sm ${theme.head}`}>
                      {delayIn !== null ? formatTimeRemaining(delayIn) : formatTimeRemaining(nextBellIn)}
                    </div>
                    
                    {/* Time indicator pill visible on smaller screens */}
                    {activeLessonTimeInfo && (
                      <div className={`sm:hidden mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md transition-all shadow-sm ${isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-slate-300' : 'bg-white/80 border-slate-200/80 text-slate-700'}`}>
                        <Clock size={12} className={activeTheme.text} />
                        <span>{activeLessonTimeInfo.range}</span>
                      </div>
                    )}

                    {/* Modern sleek progress bar */}
                    {totalDuration && (
                      <div className="w-full max-w-sm sm:max-w-md mt-5 sm:mt-7 flex flex-col gap-2">
                        <div className="h-2 sm:h-2.5 w-full bg-slate-200/60 dark:bg-white/[0.06] rounded-full overflow-hidden p-0.5 backdrop-blur-sm border border-black/5 dark:border-white/5">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${activeTheme.bg}`}
                            style={{ 
                              width: `${Math.min(100, Math.max(0, timerProgressPercent))}%`,
                              boxShadow: `0 0 12px ${activeTheme.glowColor}`
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-400 px-1">
                          <span>დარჩენილია {Math.max(0, Math.round(100 - timerProgressPercent))}%</span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} className="opacity-60" />
                            {delayIn !== null ? 'დაყოვნება (+1:20)' : 'ზარამდე'}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : status === BellStatus.WEEKEND ? (
                  <div className="flex flex-col items-center justify-center py-4 md:py-8">
                    <div className={`text-3xl sm:text-4xl md:text-6xl font-black mb-3 tracking-tight ${theme.head}`}>
                      დღეს დასვენებაა!
                    </div>
                    {holidayNameToday && (
                      <div className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 max-w-[85%] mx-auto text-center ${isDarkMode ? 'bg-amber-500/10 text-amber-300 border border-amber-500/25 shadow-inner' : 'bg-amber-100 text-amber-900 border border-amber-200 shadow-sm'}`}>
                        <PartyPopper size={16} className="shrink-0 text-amber-400" /> 
                        <span>{holidayNameToday}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`text-3xl sm:text-4xl md:text-5xl font-black py-4 md:py-8 opacity-40 ${theme.head}`}>
                    სკოლა დასრულდა
                  </div>
                )}
              </div>
            
              {/* Lesson Context: Flat, sleek & modern glass styling */}
              {lessonData && (
                <div className="w-full max-w-xl mx-auto mt-4 sm:mt-6 flex flex-col gap-3">
                  
                  {/* If Tomorrow is Holiday / Off */}
                  {lessonData.isTomorrowOff ? (
                    <div className={`w-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col items-center border relative overflow-hidden transition-all ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 'bg-amber-50/80 border-amber-200 text-amber-900'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <PartyPopper size={18} className="text-amber-400 shrink-0" />
                        <span className="text-xs uppercase font-black tracking-widest text-amber-400">
                          ხვალ დასვენებაა!
                        </span>
                      </div>
                      
                      <h3 className="text-xl sm:text-2xl font-black">{lessonData.tomorrowHolidayName}</h3>
                      
                      {lessonData.firstLesson && (
                        <div className={`mt-3 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border ${isDarkMode ? 'bg-black/25 border-white/5 text-slate-300' : 'bg-white/80 border-amber-200/50 text-slate-600'}`}>
                          <span>სკოლა განახლდება {lessonData.nextSchoolLabel}:</span>
                          <span className="font-bold text-white">{lessonData.firstLesson.subject}</span>
                        </div>
                      )}
                    </div>
                  ) : lessonData.current ? (
                    /* Regular Active or Upcoming Lesson */
                    <div className={`w-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all text-left backdrop-blur-md ${isDarkMode ? 'bg-white/[0.025] border-white/[0.08]' : 'bg-white/70 border-white/80 shadow-sm'}`}>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 ${isDarkMode ? `${activeTheme.bgSubtle} ${activeTheme.text} border ${activeTheme.border}` : activeTheme.buttonActive}`}>
                            {lessonData.current.num}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] sm:text-[11px] uppercase font-black tracking-widest truncate ${status === BellStatus.BREAK || !showTimer ? activeTheme.text : 'text-slate-400'}`}>
                                {lessonData.current.label}
                              </span>
                              {lessonData.current.isLast && !isLongCountdown && (
                                <span className="px-2 py-0.5 bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/25 text-[9px] font-black rounded-full uppercase tracking-wider shrink-0">
                                  ბოლო 🏁
                                </span>
                              )}
                            </div>
                            <h3 className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight truncate ${theme.head}`}>
                              {lessonData.current.lesson.subject}
                            </h3>
                          </div>
                        </div>

                        {lessonData.current.lesson.teacher && (
                          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 self-start sm:self-center ${isDarkMode ? 'bg-white/[0.03] border-white/[0.06] text-slate-300' : 'bg-white border-slate-200/60 text-slate-700 shadow-sm'}`}>
                            {lessonData.current.lesson.teacher}
                          </div>
                        )}
                      </div>

                      {/* Next Lesson Preview Sub-Row */}
                      {!lessonData.isTomorrowOff && lessonData.next && (
                        <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 min-w-0 text-slate-400">
                            <span className={`text-[10px] font-black uppercase tracking-wider ${activeTheme.text}`}>შემდეგი:</span>
                            <span className={`font-black truncate ${theme.head}`}>
                              {lessonData.next.subject}
                            </span>
                            {lessonData.next.isNextLast && <span className="text-amber-400 text-xs shrink-0">🏁</span>}
                          </div>
                          <span className="font-semibold text-slate-400 text-[11px] shrink-0 truncate max-w-[140px] sm:max-w-none">
                            {lessonData.next.teacher}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </main>

          {/* Desktop Online School Portal Link */}
          <div className="hidden xl:flex w-full">
            <a 
              href="https://onlineschool.emis.ge/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`w-full p-6 rounded-[2.2rem] border flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 ${theme.card}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${isDarkMode ? 'bg-white/5 border border-white/10 text-white' : activeTheme.buttonActive}`}>
                  <BookOpenCheck size={24} />
                </div>
                <div className="flex flex-col text-left">
                  <span className={`text-lg font-black tracking-tight ${theme.head}`}>ნიშნების ნახვა</span>
                  <span className={`text-[10px] uppercase font-bold transition-colors ${activeTheme.text}`}>ონლაინ სკოლის პორტალი (onlineschool.emis.ge)</span>
                </div>
              </div>
              <ExternalLink size={18} className="text-slate-400 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Right Column: Next Holiday Card & Full 11-1 Timetable */}
        <div className="w-full xl:col-span-5 flex flex-col gap-6">
          
          {/* Next Holiday Card */}
          {nextHolidayInfo && (
            <div className={`w-full p-5 sm:p-6 rounded-[2.2rem] border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 ${theme.card}`}>
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-amber-100 text-amber-700'}`}>
                  <PartyPopper size={20} />
                </div>
                <div className="flex flex-col text-left">
                  <span className={`text-sm sm:text-base font-black tracking-tight ${theme.head}`}>უახლოესი დასვენება</span>
                  <span className={`text-xs font-bold leading-tight ${theme.sub}`}>
                    {nextHolidayInfo.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-amber-500/90 dark:text-amber-300/90">
                    <span>{nextHolidayInfo.dateLabel}</span>
                    <span className="opacity-40">•</span>
                    <span className="px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wide bg-amber-500/10 dark:bg-amber-400/10 border-amber-500/20">
                      {nextHolidayInfo.weekdayName}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {nextHolidayInfo.isOngoing ? (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-xl border border-emerald-500/30 animate-pulse">
                    დღეს
                  </span>
                ) : (
                  <>
                    <span className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                      {nextHolidayInfo.daysRemaining}
                    </span>
                    <span className={`text-[9px] uppercase font-black tracking-widest ${theme.sub}`}>დღეში</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Mobile Online School Link */}
          <div className="xl:hidden w-full">
            <a 
              href="https://onlineschool.emis.ge/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`w-full p-5 rounded-[2rem] border flex items-center justify-between group transition-all duration-300 active:scale-98 ${theme.card}`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-white/5 border border-white/10 text-white' : activeTheme.buttonActive}`}>
                  <BookOpenCheck size={22} />
                </div>
                <div className="flex flex-col text-left">
                  <span className={`text-base font-black tracking-tight ${theme.head}`}>ნიშნების ნახვა</span>
                  <span className={`text-[10px] uppercase font-bold ${activeTheme.text}`}>ონლაინ სკოლა</span>
                </div>
              </div>
              <ExternalLink size={16} className="text-slate-400" />
            </a>
          </div>

          {/* Full 11-1 Class Timetable Section */}
          <section className={`w-full rounded-[2.5rem] p-6 sm:p-7 border flex flex-col ${theme.card}`}>
            
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${theme.head}`}>
                  გაკვეთილების ცხრილი
                </h2>
                <p className={`text-xs font-semibold ${theme.sub}`}>
                  11-1 კლასი • {maxPeriod} გაკვეთილი ({lastLessonEndTime}-მდე)
                </p>
              </div>

              <div className={`px-3 py-1 rounded-xl text-[10px] font-bold border ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                {maxPeriod === 6 ? '08:30 – 13:05' : '08:30 – 12:20'}
              </div>
            </div>
            
            {/* Weekday Switcher Tabs */}
            <div className="flex overflow-x-auto gap-2 mb-5 pb-1 -mx-2 px-2 snap-x" style={{ scrollbarWidth: 'none' }}>
              {[1, 2, 3, 4, 5].map(d => {
                const isToday = tbilisiTimeData.day === d;
                const isSelected = selectedDay === d;
                const lessonCount = (LESSON_SCHEDULE[d] || []).length;
                
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-4 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all snap-center shrink-0 relative border backdrop-blur-xl hover:scale-[1.02] active:scale-[0.98] ${
                      isSelected
                        ? activeTheme.buttonActive
                        : isDarkMode 
                          ? 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] border-white/[0.1]' 
                          : 'bg-white/60 border-white/70 text-slate-600 hover:bg-white/90'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{WEEKDAYS_GE[d]}</span>
                      <span className={`text-[10px] opacity-60 font-semibold px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/20' : 'bg-black/10'}`}>
                        {lessonCount}
                      </span>
                    </div>

                    {isToday && !isSelected && (
                      <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${activeTheme.bg} ring-2 ${isDarkMode ? 'ring-black/40' : 'ring-white'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Daily Lessons List */}
            <div className="flex flex-col gap-2.5">
              {selectedLessons.map((lesson, bi) => {
                const bell = BELL_TIMES[bi];
                const isHolidayToday = holidayStatusByDay[selectedDay];
                const isCurrentLesson = tbilisiTimeData.day === selectedDay && currentPeriod === bi + 1 && !isLongCountdown;
                
                return (
                  <div 
                    key={bi} 
                    className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all backdrop-blur-xl ${
                      isCurrentLesson 
                        ? (isDarkMode 
                            ? 'bg-white/[0.08] border-white/[0.22] shadow-[0_8px_24px_rgba(0,0,0,0.3)] ring-1 ring-blue-500/40' 
                            : 'bg-white border-white shadow-md ring-1 ring-blue-500/30')
                        : (isDarkMode 
                            ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]' 
                            : 'bg-white/40 border-white/60 hover:bg-white/80')
                    } ${isHolidayToday ? 'opacity-50' : ''}`}
                  >
                    {/* Period Number Badge */}
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex flex-col items-center justify-center shrink-0 font-black transition-colors ${
                      isCurrentLesson
                        ? activeTheme.buttonActive
                        : (isDarkMode ? 'bg-white/[0.04] text-slate-300 border border-white/[0.06]' : 'bg-white/80 text-slate-600 border border-slate-200/60')
                    }`}>
                      <span className="text-sm sm:text-base leading-none">{bell.period}</span>
                    </div>
                    
                    {/* Subject & Teacher Info */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm sm:text-base truncate ${isHolidayToday ? 'line-through' : ''} ${theme.head}`}>
                          {lesson.subject}
                        </span>
                        {isCurrentLesson && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${activeTheme.badge}`}>
                            ახლა
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] sm:text-xs font-semibold mt-0.5 truncate ${theme.sub}`}>
                        {lesson.teacher}
                      </span>
                    </div>
                    
                    {/* Period Bell Timing */}
                    <div className="flex flex-col items-end shrink-0 text-right">
                      <span className={`font-black text-xs sm:text-sm ${theme.head}`}>
                        {bell.start}
                      </span>
                      <span className={`text-[10px] font-semibold opacity-60 ${theme.sub}`}>
                        {bell.end}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Compact, Beautiful & Responsive 2026-2027 Official Holidays Section */}
        <section className="w-full xl:col-span-12 mb-12 mt-4 max-w-7xl mx-auto">
          <div className={`rounded-[2.5rem] p-6 sm:p-8 md:p-10 border transition-all ${theme.card}`}>
            
            {/* Header with Title and Filter Switcher */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-amber-100 text-amber-700'}`}>
                    <PartyPopper size={20} />
                  </div>
                  <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${theme.head}`}>
                    სასკოლო უქმე დღეები
                  </h2>
                </div>
                <p className={`text-xs sm:text-sm font-semibold ${theme.sub}`}>
                  2026–2027 სასწავლო წლის ოფიციალური დასვენებები და არდადეგები
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl border backdrop-blur-xl shrink-0 self-stretch sm:self-auto overflow-x-auto">
                <button
                  onClick={() => setHolidayFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    holidayFilter === 'all' 
                      ? activeTheme.buttonActive 
                      : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                  }`}
                >
                  ყველა ({OFFICIAL_HOLIDAYS_LIST.length})
                </button>
                <button
                  onClick={() => setHolidayFilter('break')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    holidayFilter === 'break' 
                      ? activeTheme.buttonActive 
                      : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                  }`}
                >
                  არდადეგები (3)
                </button>
                <button
                  onClick={() => setHolidayFilter('holiday')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    holidayFilter === 'holiday' 
                      ? activeTheme.buttonActive 
                      : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                  }`}
                >
                  უქმე დღეები (9)
                </button>
              </div>
            </div>

            {/* Responsive Grid of Compact Holiday Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
              {filteredHolidays.map((h) => {
                const isNearest = nextHolidayInfo?.id === h.id && !h.isOngoing && !h.isPast;
                
                return (
                  <div
                    key={h.id}
                    className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                      h.isOngoing
                        ? (isDarkMode 
                            ? 'bg-emerald-500/15 border-emerald-400/40 shadow-[0_4px_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/40' 
                            : 'bg-emerald-50/90 border-emerald-300 shadow-sm')
                        : isNearest
                          ? (isDarkMode 
                              ? 'bg-amber-500/10 border-amber-400/40 shadow-[0_4px_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/50' 
                              : 'bg-amber-50/90 border-amber-300 shadow-sm')
                          : h.isPast
                            ? (isDarkMode ? 'bg-white/[0.015] border-white/[0.05] opacity-50' : 'bg-slate-50/50 border-slate-200/50 opacity-60')
                            : (isDarkMode ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:-translate-y-0.5' : 'bg-white/60 border-white/80 hover:bg-white shadow-sm hover:-translate-y-0.5')
                    }`}
                  >
                    {/* Top Row: Type Badge & Status Tag */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        h.category === 'break' 
                          ? (isDarkMode ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' : 'bg-purple-100 text-purple-800 border border-purple-200')
                          : (isDarkMode ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' : 'bg-blue-100 text-blue-800 border border-blue-200')
                      }`}>
                        {h.category === 'break' ? 'არდადეგები' : 'უქმე დღე'}
                      </span>

                      {h.isOngoing ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wide animate-pulse">
                          დღეს არის
                        </span>
                      ) : isNearest ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[9px] font-black uppercase tracking-wide">
                          უახლოესი
                        </span>
                      ) : h.isPast ? (
                        <span className="text-[10px] font-bold opacity-40">
                          ჩავლილი
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400">
                          {h.daysRemaining} დღეში
                        </span>
                      )}
                    </div>

                    {/* Middle: Title & Date Label */}
                    <div className="mb-3">
                      <h3 className={`font-black text-base sm:text-lg leading-snug tracking-tight mb-1 ${theme.head}`}>
                        {h.name}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500/90 dark:text-amber-300/90">
                        <Calendar size={13} className="shrink-0" />
                        <span>{h.dateLabel}</span>
                      </div>
                    </div>

                    {/* Footer Row: Details & Weekday/Duration Tag */}
                    <div className="pt-2.5 mt-auto border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                      <span className={`truncate font-medium pr-2 opacity-70 ${theme.sub}`}>
                        {h.details}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md shrink-0 font-black text-[10px] border ${
                        isDarkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}>
                        {h.weekdayName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-10 border-t w-full xl:col-span-12 border-white/5 relative z-10">
          <p className="text-[11px] font-black tracking-[0.5em] mb-1.5 opacity-40">DESIGNED BY SMILE B</p>
          <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">© 2026–2027. 11-1 კლასის სასკოლო პორტალი</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
