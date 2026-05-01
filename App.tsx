import { Calendar, Clock, Coffee, GraduationCap, Info, LayoutGrid, Moon, PartyPopper, Sun, ArrowRight, BellRing, Bell, ExternalLink, BookOpenCheck, Flag } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { BELL_TIMES, HOLIDAYS_2026, LESSON_SCHEDULE, WEEKDAYS_GE, HOLIDAY_NAMES_GE, HOLIDAY_RANGES } from './constants';
import { BellStatus } from './types';

const BELL_DELAY_SECONDS = 40; 
const MONTH_NAMES_GE = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"
];

const checkIsHoliday = (m: number, d: number) => {
  const dateStr = `${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  if (HOLIDAYS_2026.includes(dateStr)) return true;
  const currentVal = m * 100 + d;
  for (const range of HOLIDAY_RANGES) {
    const startVal = range.start.m * 100 + range.start.d;
    const endVal = range.end.m * 100 + range.end.d;
    if (startVal <= endVal) {
      if (currentVal >= startVal && currentVal <= endVal) return true;
    } else {
      if (currentVal >= startVal || currentVal <= endVal) return true;
    }
  }
  return false;
};

const getHolidayName = (m: number, d: number) => {
  const dateStr = `${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  if (HOLIDAY_NAMES_GE[dateStr]) return HOLIDAY_NAMES_GE[dateStr];
  const currentVal = m * 100 + d;
  for (const range of HOLIDAY_RANGES) {
    const startVal = range.start.m * 100 + range.start.d;
    const endVal = range.end.m * 100 + range.end.d;
    if (startVal <= endVal) {
      if (currentVal >= startVal && currentVal <= endVal) return range.name;
    } else {
      if (currentVal >= startVal || currentVal <= endVal) return range.name;
    }
  }
  return 'დასვენება';
};

const formatTimeRemaining = (seconds: number | null) => {
  if (seconds === null) return null;
  const s = Math.ceil(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getColorConfig = (color: string, isDark: boolean) => {
  const map: Record<string, any> = {
    blue: {
      shape1: isDark ? 'rgba(59,130,246,0.35)' : 'rgba(59,130,246,0.15)',
      shape2: isDark ? 'rgba(96,165,250,0.3)' : 'rgba(96,165,250,0.15)',
      text: isDark ? 'text-blue-300' : 'text-blue-600',
      bg: 'bg-blue-500',
      bgSubtle: isDark ? 'bg-blue-500/20' : 'bg-blue-50/50',
      border: isDark ? 'border-blue-500/30' : 'border-blue-200/50',
      selection: 'selection:bg-blue-500 selection:text-white',
      buttonActive: isDark ? 'bg-blue-500 text-white shadow-[0_4px_16px_rgba(59,130,246,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]' : 'bg-blue-500 text-white shadow-[0_4px_16px_rgba(59,130,246,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]',
      ring: 'ring-blue-500/50',
      badge: isDark ? 'bg-blue-500/20 backdrop-blur-md text-blue-300 border border-blue-400/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'bg-white/60 backdrop-blur-sm text-blue-700 border border-blue-200 shadow-sm',
    },
    emerald: {
      shape1: isDark ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.15)',
      shape2: isDark ? 'rgba(52,211,153,0.25)' : 'rgba(52,211,153,0.15)',
      text: isDark ? 'text-emerald-300' : 'text-emerald-600',
      bg: 'bg-emerald-500',
      bgSubtle: isDark ? 'bg-emerald-500/20' : 'bg-emerald-50/50',
      border: isDark ? 'border-emerald-500/30' : 'border-emerald-200/50',
      selection: 'selection:bg-emerald-500 selection:text-white',
      buttonActive: isDark ? 'bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]' : 'bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]',
      ring: 'ring-emerald-500/50',
      badge: isDark ? 'bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-400/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'bg-white/60 backdrop-blur-sm text-emerald-700 border border-emerald-200 shadow-sm',
    },
    amber: {
      shape1: isDark ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.15)',
      shape2: isDark ? 'rgba(251,191,36,0.25)' : 'rgba(251,191,36,0.15)',
      text: isDark ? 'text-amber-300' : 'text-amber-600',
      bg: 'bg-amber-500',
      bgSubtle: isDark ? 'bg-amber-500/20' : 'bg-amber-50/50',
      border: isDark ? 'border-amber-500/30' : 'border-amber-200/50',
      selection: 'selection:bg-amber-500 selection:text-white',
      buttonActive: isDark ? 'bg-amber-500 text-white shadow-[0_4px_16px_rgba(245,158,11,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]' : 'bg-amber-500 text-white shadow-[0_4px_16px_rgba(245,158,11,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]',
      ring: 'ring-amber-500/50',
      badge: isDark ? 'bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'bg-white/60 backdrop-blur-sm text-amber-700 border border-amber-200 shadow-sm',
    },
    slate: {
      shape1: isDark ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.15)',
      shape2: isDark ? 'rgba(100,116,139,0.15)' : 'rgba(100,116,139,0.15)',
      text: isDark ? 'text-slate-300' : 'text-slate-600',
      bg: 'bg-slate-500',
      bgSubtle: isDark ? 'bg-white/10' : 'bg-slate-100/50',
      border: isDark ? 'border-white/20' : 'border-slate-200/50',
      selection: 'selection:bg-slate-500 selection:text-white',
      buttonActive: isDark ? 'bg-slate-600 text-white shadow-[0_4px_16px_rgba(100,116,139,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]' : 'bg-slate-700 text-white shadow-[0_4px_16px_rgba(100,116,139,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]',
      ring: 'ring-slate-500/50',
      badge: isDark ? 'bg-white/10 backdrop-blur-md text-slate-300 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'bg-white/60 backdrop-blur-sm text-slate-600 border border-slate-200 shadow-sm',
    }
  };
  return map[color];
};

const App: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(
    new Date().getDay() >= 1 && new Date().getDay() <= 5 ? new Date().getDay() : 1
  );

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const tbilisiTimeData = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tbilisi', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const parts = formatter.formatToParts(now);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
    const year = parseInt(getPart('year'));
    const month = getPart('month');
    const date = getPart('day');
    const hour = parseInt(getPart('hour'));
    const minute = parseInt(getPart('minute'));
    const second = parseInt(getPart('second'));
    const tbilisiNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tbilisi' }));
    return { day: tbilisiNow.getDay(), m: parseInt(month), d: parseInt(date), hour, minute, second, year, raw: tbilisiNow };
  }, [now]);

  const { status, nextBellIn, delayIn, currentPeriod, nextEventLabel, nextSchoolDay, showTimer } = useMemo(() => {
    const { day, m, d, hour, minute, second, raw } = tbilisiTimeData;
    const isHoliday = checkIsHoliday(m, d);
    
    const getNextSchoolStartTime = () => {
      let nextDate = new Date(raw);
      nextDate.setHours(8, 30, 0, 0);
      let found = false;
      while (!found) {
        nextDate.setDate(nextDate.getDate() + 1);
        const nm = nextDate.getMonth() + 1;
        const nd = nextDate.getDate();
        const nDay = nextDate.getDay();
        if (nDay !== 0 && nDay !== 6 && !checkIsHoliday(nm, nd)) {
          found = true;
        }
      }
      return { time: nextDate, day: nextDate.getDay() };
    };

    const currentTimeInSeconds = hour * 3600 + minute * 60 + second;
    const firstStart = BELL_TIMES[0].start.split(':').map(Number);
    const startOfDaySecs = firstStart[0] * 3600 + firstStart[1] * 60;
    
    // Determine the last lesson for TODAY specifically
    const todaySchedule = LESSON_SCHEDULE[day] || [];
    const lastLessonIndex = todaySchedule.length > 0 ? todaySchedule.length - 1 : BELL_TIMES.length - 1;
    const lastEnd = BELL_TIMES[lastLessonIndex].end.split(':').map(Number);
    const endOfDaySecs = lastEnd[0] * 3600 + lastEnd[1] * 60;

    // School is closed logic (Weekend or Holiday or After Last Lesson)
    if (day === 0 || day === 6 || isHoliday || currentTimeInSeconds > endOfDaySecs + BELL_DELAY_SECONDS) {
      const nextInfo = getNextSchoolStartTime();
      let label = 'სკოლის დაწყებამდე';
      if (day === 5 || day === 6 || day === 0) label = 'ორშაბათამდე';
      else label = 'ხვალამდე';

      return { 
        status: (day === 0 || day === 6 || isHoliday) ? BellStatus.WEEKEND : BellStatus.AFTER_SCHOOL, 
        nextBellIn: null, // User requested no timer after school/on weekends
        delayIn: null, 
        currentPeriod: 0, 
        nextEventLabel: label,
        nextSchoolDay: nextInfo.day,
        showTimer: false
      };
    }

    // Before school today (from 00:00 to 08:30)
    if (currentTimeInSeconds < startOfDaySecs) {
      return { 
        status: BellStatus.BEFORE_SCHOOL, 
        nextBellIn: startOfDaySecs - currentTimeInSeconds, 
        delayIn: null, 
        currentPeriod: 0, 
        nextEventLabel: 'გაკვეთილების დაწყებამდე',
        showTimer: true 
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
        return { status: BellStatus.LESSON, nextBellIn: eSecs - currentTimeInSeconds, delayIn: null, currentPeriod: i + 1, nextEventLabel: 'გაკვეთილის დასრულებამდე', showTimer: true };
      }
      if (currentTimeInSeconds >= eSecs && currentTimeInSeconds < eSecs + BELL_DELAY_SECONDS) {
        return { status: BellStatus.LESSON, nextBellIn: 0, delayIn: (eSecs + BELL_DELAY_SECONDS) - currentTimeInSeconds, currentPeriod: i + 1, nextEventLabel: 'ზარის მოლოდინი (დაგვიანება)', showTimer: true };
      }
      if (i < todaySchedule.length - 1) {
        const nextStart = BELL_TIMES[i+1].start.split(':').map(Number);
        const nsSecs = nextStart[0] * 3600 + nextStart[1] * 60;
        if (currentTimeInSeconds >= eSecs + BELL_DELAY_SECONDS && currentTimeInSeconds < nsSecs) {
           return { status: BellStatus.BREAK, nextBellIn: nsSecs - currentTimeInSeconds, delayIn: null, currentPeriod: i + 1, nextEventLabel: 'დასვენების დასრულებამდე', showTimer: true };
        }
        if (currentTimeInSeconds >= nsSecs && currentTimeInSeconds < nsSecs + BELL_DELAY_SECONDS) {
          return { status: BellStatus.BREAK, nextBellIn: 0, delayIn: (nsSecs + BELL_DELAY_SECONDS) - currentTimeInSeconds, currentPeriod: i + 1, nextEventLabel: 'ზარის მოლოდინი (დაწყება)', showTimer: true };
        }
      }
    }

    return { status: BellStatus.AFTER_SCHOOL, nextBellIn: null, delayIn: null, currentPeriod: 0, nextEventLabel: 'დასრულდა', showTimer: false };
  }, [tbilisiTimeData]);

  // isLongCountdown is true if we are in a state that represents a long gap between school hours (weekend, holiday, after school, or early morning)
  const isLongCountdown = status === BellStatus.BEFORE_SCHOOL || status === BellStatus.AFTER_SCHOOL || status === BellStatus.WEEKEND;

  const lessonData = useMemo(() => {
    const isOut = status === BellStatus.AFTER_SCHOOL || status === BellStatus.WEEKEND;
    const targetDay = isOut ? (nextSchoolDay || 1) : tbilisiTimeData.day;
    const daySchedule = LESSON_SCHEDULE[targetDay];
    if (!daySchedule) return null;

    if (isOut) {
      let label = tbilisiTimeData.day === 5 ? 'ორშაბათს' : 'ხვალ';
      return { 
        current: { label, lesson: daySchedule[0], num: 1, isLast: daySchedule.length === 1 }, 
        next: daySchedule[1] ? { ...daySchedule[1], num: 2, isNextLast: daySchedule.length === 2 } : null 
      };
    }

    if (status === BellStatus.BEFORE_SCHOOL) {
      return { 
        current: { label: 'პირველი გაკვეთილი', lesson: daySchedule[0], num: 1, isLast: daySchedule.length === 1 }, 
        next: daySchedule[1] ? { ...daySchedule[1], num: 2, isNextLast: daySchedule.length === 2 } : null 
      };
    }
    
    if (status === BellStatus.LESSON) {
      const isLast = currentPeriod === daySchedule.length;
      const next = daySchedule[currentPeriod];
      return { 
        current: { label: 'ახლა გვაქვს', lesson: daySchedule[currentPeriod - 1], num: currentPeriod, isLast }, 
        next: next ? { ...next, num: currentPeriod + 1, isNextLast: currentPeriod + 1 === daySchedule.length } : null 
      };
    }
    
    if (status === BellStatus.BREAK) {
      const next = daySchedule[currentPeriod];
      const following = daySchedule[currentPeriod + 1];
      const isNextLast = currentPeriod + 1 === daySchedule.length;
      return next ? { 
        current: { label: 'შემდეგი გაკვეთილი', lesson: next, num: currentPeriod + 1, isLast: isNextLast }, 
        next: following ? { ...following, num: currentPeriod + 2, isNextLast: currentPeriod + 2 === daySchedule.length } : null 
      } : null;
    }
    
    return null;
  }, [tbilisiTimeData.day, status, currentPeriod, nextSchoolDay]);

  const { holidayStatusByDay, nextHolidayInfo, holidaysByMonth } = useMemo(() => {
    const { raw, year } = tbilisiTimeData;
    
    const hStatus: Record<number, boolean> = {};
    const tempDate = new Date(raw);
    const currentDay = tempDate.getDay(); 
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    tempDate.setDate(tempDate.getDate() + diffToMonday);
    
    for (let i = 1; i <= 5; i++) {
      const d = new Date(tempDate);
      d.setDate(tempDate.getDate() + (i - 1));
      hStatus[i] = checkIsHoliday(d.getMonth() + 1, d.getDate());
    }

    let nextInfo = null;
    let minDiff = Infinity;

    const checkHolidayDate = (m: number, d: number, name: string) => {
      let hDate = new Date(year, m - 1, d);
      // If the holiday has already passed this year, check next year
      if (hDate.getTime() < raw.getTime() - 24 * 60 * 60 * 1000) {
        hDate.setFullYear(year + 1);
      }
      
      const diff = hDate.getTime() - raw.getTime();
      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        nextInfo = { 
          name, 
          date: hDate, 
          days: Math.ceil(diff / (1000 * 60 * 60 * 24)) 
        };
      }
    };

    for (const hStr of HOLIDAYS_2026) {
      const [m, d] = hStr.split('-').map(Number);
      checkHolidayDate(m, d, HOLIDAY_NAMES_GE[hStr] || 'დასვენება');
    }

    for (const range of HOLIDAY_RANGES) {
      checkHolidayDate(range.start.m, range.start.d, range.name);
    }

    const groups: Record<number, { day: number, name: string, isWeekend: boolean }[]> = {};
    for (let m = 1; m <= 12; m++) {
      const daysInMonth = new Date(2026, m, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        if (checkIsHoliday(m, d)) {
          if (!groups[m]) groups[m] = [];
          
          const name = getHolidayName(m, d);
          const holidayDate = new Date(2026, m - 1, d);
          const dow = holidayDate.getDay();
          
          // Check if it is a long break (Ardadagebi)
          const isLongBreak = name.includes('არდადეგები');
          // Only mark as weekend miss if it's NOT a long break
          const isWeekend = !isLongBreak && (dow === 0 || dow === 6);
          
          groups[m].push({ day: d, name, isWeekend });
        }
      }
    }

    return { holidayStatusByDay: hStatus, nextHolidayInfo: nextInfo, holidaysByMonth: groups };
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
        blue: '#0d1323',
        emerald: '#111814',
        amber: '#1c1711',
        slate: '#161618',
      },
      light: {
        blue: '#f4f7ff',
        emerald: '#f8fdfa',
        amber: '#fffdf8',
        slate: '#fcfcfc',
      }
    };
    
    const bgColor = isDarkMode ? bgColors.dark[activeColor as keyof typeof bgColors.dark] : bgColors.light[activeColor as keyof typeof bgColors.light];
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
    document.documentElement.className = 'transition-colors duration-1000';
  }, [isDarkMode, activeColor]);

  const theme = {
    card: isDarkMode 
      ? 'bg-white/[0.04] backdrop-blur-[40px] border-white/[0.15] shadow-[0_16px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)]' 
      : 'bg-white/50 backdrop-blur-3xl border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07),inset_0_1px_1px_rgba(255,255,255,1)]',
    sub: isDarkMode ? 'text-slate-300' : 'text-slate-500 font-semibold',
    head: isDarkMode ? 'text-white drop-shadow-sm' : 'text-slate-900',
    muted: isDarkMode ? 'bg-black/20 border-white/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]' : 'bg-white/50 border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]',
    border: isDarkMode ? 'border-white/[0.08]' : 'border-slate-300/30',
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} p-4 md:p-8 flex flex-col items-center max-w-7xl mx-auto overflow-hidden ${activeTheme.selection}`}>
      
      {/* Morphing Background Blobs */}
      <div 
        className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] min-w-[400px] min-h-[400px] rounded-full blur-[100px] opacity-100 transition-colors duration-1000 mix-blend-normal pointer-events-none animate-blob"
        style={{ background: activeTheme.shape1 }}
      />
      <div 
        className="fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] min-w-[500px] min-h-[500px] rounded-full blur-[120px] opacity-100 transition-colors duration-1000 mix-blend-normal pointer-events-none animate-blob animation-delay-2000"
        style={{ background: activeTheme.shape2 }}
      />

      <div className="relative z-10 w-full flex flex-col items-center">
        <style>{`
          .finish-pattern {
            background-image: repeating-conic-gradient(#000 0 90deg, #fff 0 180deg);
            background-size: 16px 16px;
          }
          .finish-pattern-dark {
            background-image: repeating-conic-gradient(rgba(255,255,255,0.05) 0 90deg, rgba(0,0,0,0.1) 0 180deg);
            background-size: 16px 16px;
          }
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob {
            animation: blob 15s infinite alternate ease-in-out;
          }
          .animation-delay-2000 {
            animation-delay: -5s;
          }
        `}</style>

        <div className="w-full flex justify-end gap-3 mb-6 relative z-50">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className={`p-3.5 rounded-2xl transition-all border ${isDarkMode ? 'bg-white/[0.05] border-white/[0.15] text-amber-300 hover:bg-white/[0.1] shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:-translate-y-0.5' : 'bg-white/60 border-white/80 text-slate-600 shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,1)] hover:bg-white/80 hover:-translate-y-0.5'} backdrop-blur-xl`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <header className="text-center mb-8 md:mb-10">
          <h1 className={`text-3xl sm:text-4xl md:text-7xl font-black mb-2 tracking-tight transition-colors duration-1000 ${theme.head}`}>ზარი რამდენ ხანშია?</h1>
          <div className="flex flex-col items-center">
            <p className={`${theme.sub} flex items-center justify-center gap-2 font-medium text-base md:text-lg`}>
              <Calendar size={18} className={`transition-colors duration-1000 ${activeTheme.text}`} />
              {tbilisiTimeData.d} {MONTH_NAMES_GE[tbilisiTimeData.m - 1]} • {WEEKDAYS_GE[tbilisiTimeData.day]}, {tbilisiTimeData.hour.toString().padStart(2, '0')}:{tbilisiTimeData.minute.toString().padStart(2, '0')}
            </p>
          </div>
        </header>

        <main className={`w-full max-w-2xl rounded-[2rem] md:rounded-[3rem] border p-6 md:p-14 mb-8 text-center relative overflow-hidden transition-all duration-1000 ${theme.card}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <div className={`absolute top-0 left-0 w-full h-1.5 transition-colors duration-1000 ${delayIn ? 'bg-amber-500 animate-pulse' : activeTheme.bg}`} />
          
          <div className="flex flex-col items-center relative z-10">
            <span className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black mb-6 md:mb-8 flex items-center gap-2 uppercase tracking-[0.2em] transition-colors duration-1000 ${activeTheme.badge}`}>
              {status === BellStatus.LESSON ? <GraduationCap size={16} /> : status === BellStatus.BREAK ? <Coffee size={16} /> : <Flag size={16} />} {nextEventLabel}
            </span>
          
          <div className="mb-4 md:mb-6">
            {showTimer ? (
              <div className={`text-4xl sm:text-6xl md:text-[9rem] font-black tabular-nums tracking-tighter leading-none ${theme.head}`}>
                {delayIn !== null ? formatTimeRemaining(delayIn) : formatTimeRemaining(nextBellIn)}
              </div>
            ) : (
              <div className={`text-2xl sm:text-3xl md:text-5xl font-black py-6 md:py-10 opacity-30 ${theme.head}`}>
                — — : — —
              </div>
            )}
          </div>
          
          {lessonData && (
            <div className="w-full flex flex-col gap-4">
              <div className={`w-full rounded-[2.5rem] p-8 flex flex-col items-center border transition-all relative overflow-hidden ${theme.muted}`}>
                {lessonData.current.isLast && (
                  <div className={`absolute inset-0 pointer-events-none opacity-10 ${isDarkMode ? 'finish-pattern-dark' : 'finish-pattern'}`} />
                )}
                
                <div className="flex items-center gap-3 mb-2 relative z-10">
                   <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors duration-1000 shadow-inner ${isDarkMode ? `${activeTheme.bgSubtle} ${activeTheme.text} border ${activeTheme.border}` : activeTheme.buttonActive}`}>
                      {lessonData.current.num}
                   </div>
                   <span className={`text-[10px] uppercase font-black tracking-widest transition-colors duration-1000 ${status === BellStatus.BREAK || !showTimer ? activeTheme.text : 'text-slate-500'}`}>
                    {lessonData.current.label}
                  </span>
                </div>
                
                <h3 className={`text-3xl font-black relative z-10 ${theme.head}`}>{lessonData.current.lesson.subject}</h3>
                <p className={`${theme.sub} font-black text-lg mt-1 relative z-10`}>{lessonData.current.lesson.teacher}</p>
                
                {lessonData.current.isLast && !isLongCountdown && (
                  <span className="mt-4 px-3 py-1 bg-amber-500 text-black text-[10px] font-black rounded-full uppercase tracking-widest relative z-10">ბოლო გაკვეთილი 🏁</span>
                )}
              </div>

              {lessonData.next && (
                <div className={`w-full rounded-[2rem] p-5 flex items-center justify-between border transition-all overflow-hidden relative ${isDarkMode ? 'bg-black/20 border-white/10 shadow-[inner_0_1px_1px_rgba(255,255,255,0.05)]' : 'bg-white/60 border-white/50 shadow-[0_4px_16px_rgba(0,0,0,0.02)]'}`}>
                  {lessonData.next.isNextLast && (
                    <div className={`absolute inset-0 pointer-events-none opacity-[0.05] ${isDarkMode ? 'finish-pattern-dark' : 'finish-pattern'}`} />
                  )}
                  
                  <div className="flex flex-col items-start relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                       <div className="w-5 h-5 rounded-md bg-slate-500/10 flex items-center justify-center text-[8px] font-black text-slate-500 border border-slate-500/20">
                          {lessonData.next.num}
                       </div>
                       <span className={`text-[9px] uppercase font-black transition-colors duration-1000 ${activeTheme.text} tracking-widest`}>შემდეგი</span>
                    </div>
                    <h4 className={`text-lg font-black tracking-tight ${theme.head}`}>{lessonData.next.subject}</h4>
                  </div>
                  <div className="flex items-center gap-3 relative z-10">
                    {lessonData.next.isNextLast && <span className="text-amber-500 drop-shadow-sm text-sm">🏁</span>}
                    <span className="text-[11px] font-bold text-slate-500 opacity-60">
                      {lessonData.next.teacher}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {nextHolidayInfo && (
        <div className={`w-full max-w-2xl mb-8 p-5 md:p-6 rounded-[2rem] border flex items-center justify-between transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-2xl ${theme.card}`}>
          <div className="flex items-center gap-3 md:gap-4">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
              <PartyPopper size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col text-left">
              <span className={`text-sm md:text-base font-black tracking-tight ${theme.head}`}>უახლოესი დასვენება</span>
              <span className={`text-[10px] md:text-xs font-bold ${theme.sub}`}>{nextHolidayInfo.name} ({nextHolidayInfo.date.getDate()} {MONTH_NAMES_GE[nextHolidayInfo.date.getMonth()]}, {WEEKDAYS_GE[nextHolidayInfo.date.getDay()]})</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-xl md:text-3xl font-black ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{nextHolidayInfo.days}</span>
            <span className={`text-[9px] md:text-[10px] uppercase font-black tracking-widest ${theme.sub}`}>დღეში</span>
          </div>
        </div>
      )}

        <a 
          href="https://onlineschool.emis.ge/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`w-full max-w-2xl mb-12 p-6 rounded-[2rem] border flex items-center justify-between group transition-all duration-700 ease-out transform active:scale-95 ${theme.card} hover:-translate-y-1.5 hover:shadow-2xl`}
        >
          <div className="flex items-center gap-5">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 ${isDarkMode ? 'bg-white/5 border border-white/5 text-white' : activeTheme.buttonActive}`}>
               <BookOpenCheck size={28} />
             </div>
             <div className="flex flex-col text-left">
                <span className={`text-xl font-black tracking-tight ${theme.head}`}>ნიშნების ნახვა</span>
                <span className={`text-[10px] uppercase font-black transition-colors duration-500 ${activeTheme.text}`}>ონლაინ სკოლის პორტალი</span>
             </div>
          </div>
          <ExternalLink size={18} className="text-slate-400 transition-transform group-hover:scale-110" />
        </a>

      <section className="w-full mb-16 max-w-2xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <h2 className={`text-3xl font-black px-2 text-center ${theme.head}`}>გაკვეთილების ცხრილი</h2>
          <p className={`mt-2 ${theme.sub} font-bold opacity-70`}>10-1 კლასი</p>
        </div>
        
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 pt-2 -mt-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
          {[1, 2, 3, 4, 5].map(d => {
            const isToday = tbilisiTimeData.day === d;
            return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-5 py-3 rounded-2xl font-black text-xs md:text-sm whitespace-nowrap transition-all duration-700 ease-out snap-center shrink-0 relative border backdrop-blur-xl shadow-sm hover:scale-[1.02] active:scale-[0.98] ${
                selectedDay === d
                  ? activeTheme.buttonActive
                  : isDarkMode ? 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] border-white/[0.1] shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.05)]' : 'bg-white/60 border-white/60 text-slate-500 hover:bg-white/90 shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,1)]'
              }`}
            >
              {WEEKDAYS_GE[d]}
              {isToday && selectedDay !== d && (
                <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${activeTheme.bg} shadow-sm ring-2 ${isDarkMode ? 'ring-black/20' : 'ring-white/50'}`} />
              )}
            </button>
          )})}
        </div>

        <div className="flex flex-col gap-3">
          {BELL_TIMES.map((bell, bi) => {
            const l = LESSON_SCHEDULE[selectedDay][bi];
            const isHolidayToday = holidayStatusByDay[selectedDay];
            const isCurrentLesson = tbilisiTimeData.day === selectedDay && currentPeriod === bi + 1 && !isLongCountdown;
            
            return (
              <div key={bi} className={`flex items-center gap-4 p-4 md:p-5 rounded-3xl border transition-all duration-500 backdrop-blur-xl ${
                isCurrentLesson 
                  ? `${isDarkMode ? 'bg-white/[0.08] border-white/[0.2] shadow-[0_8px_24px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)]' : 'bg-white border-white/60 shadow-md ring-1 ring-blue-500/20'}` 
                  : (isDarkMode ? 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.06] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]' : 'bg-white/30 border-white/40 hover:bg-white/60 hover:shadow-sm')
              } ${isHolidayToday ? 'opacity-50' : ''}`}>
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-colors duration-500 ${
                  isCurrentLesson
                    ? activeTheme.buttonActive
                    : isDarkMode ? 'bg-white/[0.03] text-slate-300 border border-white/[0.05]' : 'bg-white/80 text-slate-500 border border-slate-200/50'
                }`}>
                  <span className="font-black text-lg md:text-xl leading-none">{bell.period}</span>
                </div>
                
                <div className="flex flex-col min-w-0 flex-1">
                  {l ? (
                    <>
                      <span className={`font-black text-base md:text-lg truncate ${isHolidayToday ? 'line-through' : ''} ${theme.head}`}>{l.subject}</span>
                      <span className={`text-xs md:text-sm font-bold mt-0.5 truncate ${theme.sub}`}>{l.teacher}</span>
                    </>
                  ) : (
                    <span className={`font-black text-base md:text-lg opacity-30 ${theme.head}`}>—</span>
                  )}
                </div>
                
                <div className="flex flex-col items-end shrink-0 text-right">
                  <span className={`font-black text-sm md:text-base ${theme.head}`}>{bell.start}</span>
                  <span className={`text-[10px] md:text-xs font-bold ${theme.sub}`}>{bell.end}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="w-full mb-24">
        <div className="flex flex-col items-center mb-10">
            <h2 className={`text-3xl md:text-4xl font-black tracking-tight text-center ${theme.head}`}>2026 წლის უქმე დღეები</h2>
            <p className={`mt-2 ${theme.sub} font-bold opacity-70 text-sm md:text-base`}>არდადეგები და სახელმწიფო დასვენებები</p>
        </div>
        
        <div className="flex overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 gap-4 md:gap-6 snap-x snap-mandatory" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
          {MONTH_NAMES_GE.map((monthName, idx) => {
            const mNum = idx + 1;
            const holidays = holidaysByMonth[mNum] || [];
            const isCurr = tbilisiTimeData.m === mNum;

            if (holidays.length === 0) return null;

            const holidayGroups = holidays.reduce((acc: any[], curr) => {
              if (acc.length > 0) {
                const last = acc[acc.length - 1];
                if (last.name === curr.name && curr.day === last.end + 1) {
                  last.end = curr.day;
                  return acc;
                }
              }
              acc.push({ start: curr.day, end: curr.day, name: curr.name, isWeekend: curr.isWeekend });
              return acc;
            }, []);

            return (
              <div key={monthName} className={`min-w-[280px] md:min-w-[320px] snap-center shrink-0 p-6 md:p-8 rounded-[2.5rem] border transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${theme.card} ${isCurr ? `ring-1 ${activeTheme.ring} shadow-[0_0_30px_rgba(255,255,255,0.05)]` : ''}`}>
                <h3 className={`font-black text-2xl mb-6 transition-colors duration-500 ${isCurr ? activeTheme.text : theme.head}`}>{monthName}</h3>
                <div className="space-y-3">
                  {holidayGroups.map((g: any, i: number) => {
                    const dayOfWeek = WEEKDAYS_GE[new Date(2026, mNum - 1, g.start).getDay()];
                    return (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' : 'bg-white/40 border-white/60 hover:bg-white/80 hover:shadow-sm'} backdrop-blur-xl`}>
                       <div className={`w-12 h-10 rounded-xl flex flex-col items-center justify-center font-black shrink-0 shadow-inner ${g.isWeekend ? 'bg-red-500/20 text-red-400' : isDarkMode ? 'bg-white/10 text-emerald-400' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        <span className="text-sm leading-none">{g.start}</span>
                        {g.end > g.start && (
                          <><div className="w-1/2 h-[1px] bg-current opacity-30 my-0.5" /><span className="text-sm leading-none">{g.end}</span></>
                        )}
                       </div>
                       <div className="flex flex-col min-w-0">
                          <span className={`font-black text-sm truncate ${theme.head}`}>{g.name}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${g.isWeekend ? 'text-red-500/70' : 'text-emerald-500/70'}`}>
                            {dayOfWeek} • {g.isWeekend ? 'გამოტოვებული' : 'დასვენება'}
                          </span>
                       </div>
                    </div>
                  )})}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="text-center py-20 border-t w-full border-slate-200/10 relative z-10">
        <p className="text-[11px] font-black tracking-[0.6em] mb-2 opacity-40">DESIGNED BY SMILE B</p>
        <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">© 2026. 10-1 კლასის სასკოლო პორტალი</p>
      </footer>
    </div>
  </div>
  );
};

export default App;