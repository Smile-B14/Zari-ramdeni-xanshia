import { Calendar, Clock, Coffee, GraduationCap, Info, LayoutGrid, Moon, PartyPopper, Sun, ArrowRight, BellRing, Bell, ExternalLink, BookOpenCheck, Flag } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { BELL_TIMES, HOLIDAYS_2026, LESSON_SCHEDULE, WEEKDAYS_GE, HOLIDAY_NAMES_GE, HOLIDAY_RANGES } from './constants';
import { BellStatus } from './types';

const BELL_DELAY_SECONDS = 105; 
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

const formatTimeRemaining = (seconds: number | null, forceFull = false) => {
  if (seconds === null) return '00:00:00';
  const s = Math.ceil(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  
  if (hrs > 0 || forceFull) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const App: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const bgColor = isDarkMode ? '#09090b' : '#f8fafc';
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
    document.documentElement.className = isDarkMode ? 'bg-zinc-950 transition-colors duration-500' : 'bg-slate-50 transition-colors duration-500';
  }, [isDarkMode]);

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

  const { status, nextBellIn, delayIn, currentPeriod, nextEventLabel, nextSchoolDay } = useMemo(() => {
    const { day, m, d, hour, minute, second, raw } = tbilisiTimeData;
    const isHoliday = checkIsHoliday(m, d);
    
    // Logic for next school day start
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
    const lastEnd = BELL_TIMES[BELL_TIMES.length - 1].end.split(':').map(Number);
    const endOfDaySecs = lastEnd[0] * 3600 + lastEnd[1] * 60;

    // Before school starts today
    if (currentTimeInSeconds < startOfDaySecs && !isHoliday && day !== 0 && day !== 6) {
      return { status: BellStatus.BEFORE_SCHOOL, nextBellIn: startOfDaySecs - currentTimeInSeconds, delayIn: null, currentPeriod: 0, nextEventLabel: 'პირველი გაკვეთილის დაწყებამდე', nextSchoolDay: day };
    }

    // Weekend or holiday or after school - need countdown to next school day
    if (day === 0 || day === 6 || isHoliday || currentTimeInSeconds > endOfDaySecs + BELL_DELAY_SECONDS) {
      const nextInfo = getNextSchoolStartTime();
      const diffSecs = (nextInfo.time.getTime() - raw.getTime()) / 1000;
      let label = 'სკოლის დაწყებამდე';
      if (day === 5 || day === 6 || day === 0) label = 'ორშაბათამდე';
      else label = 'ხვალამდე';

      return { 
        status: day === 0 || day === 6 || isHoliday ? BellStatus.WEEKEND : BellStatus.AFTER_SCHOOL, 
        nextBellIn: diffSecs, 
        delayIn: null, 
        currentPeriod: 0, 
        nextEventLabel: label,
        nextSchoolDay: nextInfo.day
      };
    }

    for (let i = 0; i < BELL_TIMES.length; i++) {
      const b = BELL_TIMES[i];
      const s = b.start.split(':').map(Number);
      const e = b.end.split(':').map(Number);
      const sSecs = s[0] * 3600 + s[1] * 60;
      const eSecs = e[0] * 3600 + e[1] * 60;
      if (currentTimeInSeconds >= sSecs && currentTimeInSeconds < eSecs) {
        return { status: BellStatus.LESSON, nextBellIn: eSecs - currentTimeInSeconds, delayIn: null, currentPeriod: i + 1, nextEventLabel: 'გაკვეთილის დასრულებამდე' };
      }
      if (currentTimeInSeconds >= eSecs && currentTimeInSeconds < eSecs + BELL_DELAY_SECONDS) {
        return { status: BellStatus.LESSON, nextBellIn: 0, delayIn: (eSecs + BELL_DELAY_SECONDS) - currentTimeInSeconds, currentPeriod: i + 1, nextEventLabel: 'ზარის მოლოდინი (დაგვიანება)' };
      }
      if (i < BELL_TIMES.length - 1) {
        const nextStart = BELL_TIMES[i+1].start.split(':').map(Number);
        const nsSecs = nextStart[0] * 3600 + nextStart[1] * 60;
        if (currentTimeInSeconds >= eSecs + BELL_DELAY_SECONDS && currentTimeInSeconds < nsSecs) {
           return { status: BellStatus.BREAK, nextBellIn: nsSecs - currentTimeInSeconds, delayIn: null, currentPeriod: i + 1, nextEventLabel: 'დასვენების დასრულებამდე' };
        }
        if (currentTimeInSeconds >= nsSecs && currentTimeInSeconds < nsSecs + BELL_DELAY_SECONDS) {
          return { status: BellStatus.BREAK, nextBellIn: 0, delayIn: (nsSecs + BELL_DELAY_SECONDS) - currentTimeInSeconds, currentPeriod: i + 1, nextEventLabel: 'ზარის მოლოდინი (დაწყება)' };
        }
      }
    }
    return { status: BellStatus.AFTER_SCHOOL, nextBellIn: null, delayIn: null, currentPeriod: 0, nextEventLabel: 'დასრულდა' };
  }, [tbilisiTimeData]);

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
    const { raw } = tbilisiTimeData;
    
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

    for (const hStr of HOLIDAYS_2026) {
      const [m, d] = hStr.split('-').map(Number);
      let hDate = new Date(raw.getFullYear(), m - 1, d);
      if (hDate.getTime() < raw.getTime()) {
        hDate.setFullYear(raw.getFullYear() + 1);
      }
      
      const diff = hDate.getTime() - raw.getTime();
      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        nextInfo = { 
          name: HOLIDAY_NAMES_GE[hStr] || 'დასვენება', 
          date: hDate, 
          days: Math.ceil(diff / (1000 * 60 * 60 * 24)) 
        };
      }
    }

    for (const range of HOLIDAY_RANGES) {
      let hDate = new Date(raw.getFullYear(), range.start.m - 1, range.start.d);
      if (hDate.getTime() < raw.getTime()) {
        const startVal = range.start.m * 100 + range.start.d;
        const endVal = range.end.m * 100 + range.end.d;
        const curVal = (raw.getMonth() + 1) * 100 + raw.getDate();
        let inRange = false;
        if (startVal <= endVal) inRange = curVal >= startVal && curVal <= endVal;
        else inRange = curVal >= startVal || curVal <= endVal;
        
        if (inRange) continue;
        hDate.setFullYear(raw.getFullYear() + 1);
      }
      
      const diff = hDate.getTime() - raw.getTime();
      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        nextInfo = { 
          name: range.name, 
          date: hDate, 
          days: Math.ceil(diff / (1000 * 60 * 60 * 24)) 
        };
      }
    }

    const groups: Record<number, { day: number, name: string }[]> = {};
    for (let m = 1; m <= 12; m++) {
      const daysInMonth = new Date(2026, m, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        if (checkIsHoliday(m, d)) {
          if (!groups[m]) groups[m] = [];
          groups[m].push({ day: d, name: getHolidayName(m, d) });
        }
      }
    }

    return { holidayStatusByDay: hStatus, nextHolidayInfo: nextInfo, holidaysByMonth: groups };
  }, [tbilisiTimeData]);

  const theme = {
    card: isDarkMode 
      ? 'bg-zinc-900 border-white/5 shadow-2xl' 
      : 'bg-white border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    sub: isDarkMode ? 'text-slate-400' : 'text-slate-500 font-semibold',
    head: isDarkMode ? 'text-white' : 'text-slate-900',
    muted: isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100',
    border: isDarkMode ? 'border-white/5' : 'border-slate-100',
    accent: isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200',
    holidayCard: isDarkMode ? 'bg-zinc-900/50 hover:bg-zinc-800' : 'bg-white hover:bg-slate-50 border-slate-100'
  };

  const isLongCountdown = status === BellStatus.AFTER_SCHOOL || status === BellStatus.WEEKEND;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} p-4 md:p-8 flex flex-col items-center max-w-7xl mx-auto selection:bg-indigo-500 selection:text-white`}>
      <style>{`
        .finish-pattern {
          background-image: repeating-conic-gradient(#000 0 90deg, #fff 0 180deg);
          background-size: 16px 16px;
        }
        .finish-pattern-dark {
          background-image: repeating-conic-gradient(#333 0 90deg, #000 0 180deg);
          background-size: 16px 16px;
        }
      `}</style>

      <div className="w-full flex justify-end gap-3 mb-6">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className={`p-3.5 rounded-2xl transition-all ${isDarkMode ? 'bg-zinc-800 text-amber-400' : 'bg-white border border-slate-200 text-indigo-600 shadow-sm hover:shadow-md'}`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <header className="text-center mb-10">
        <h1 className={`text-4xl md:text-7xl font-black mb-2 tracking-tight ${theme.head}`}>ზარი რამდენ ხანშია?</h1>
        <p className={`${theme.sub} flex items-center justify-center gap-2 font-medium text-lg`}>
          <Calendar size={20} className="text-indigo-400" />
          {WEEKDAYS_GE[tbilisiTimeData.day]}, {tbilisiTimeData.hour.toString().padStart(2, '0')}:{tbilisiTimeData.minute.toString().padStart(2, '0')}
        </p>
      </header>

      <main className={`w-full max-w-2xl rounded-[3rem] border p-8 md:p-14 mb-8 text-center relative overflow-hidden transition-all ${theme.card}`}>
        <div className={`absolute top-0 left-0 w-full h-2 ${delayIn ? 'bg-amber-500 animate-pulse' : status === BellStatus.LESSON ? 'bg-indigo-500' : status === BellStatus.BREAK ? 'bg-emerald-500' : 'bg-slate-700'}`} />
        
        <div className="flex flex-col items-center relative z-10">
          <span className={`px-5 py-2 rounded-full text-[10px] font-black mb-8 flex items-center gap-2 uppercase tracking-[0.2em] ${status === BellStatus.LESSON ? (isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-700') : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600')}`}>
            {status === BellStatus.LESSON ? <GraduationCap size={18} /> : status === BellStatus.BREAK ? <Coffee size={18} /> : <Flag size={18} />} {nextEventLabel}
          </span>
          <div className={`text-6xl md:text-[9rem] font-black tabular-nums tracking-tighter leading-none mb-6 ${theme.head}`}>
            {delayIn !== null ? formatTimeRemaining(delayIn, isLongCountdown) : formatTimeRemaining(nextBellIn, isLongCountdown)}
          </div>
          
          {lessonData && (
            <div className="w-full flex flex-col gap-4">
              <div className={`w-full rounded-[2.5rem] p-8 flex flex-col items-center border transition-all relative overflow-hidden ${theme.muted}`}>
                {lessonData.current.isLast && (
                  <div className={`absolute inset-0 pointer-events-none opacity-10 ${isDarkMode ? 'finish-pattern-dark' : 'finish-pattern'}`} />
                )}
                
                <div className="flex items-center gap-3 mb-2 relative z-10">
                   <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-600 text-white'}`}>
                      {lessonData.current.num}
                   </div>
                   <span className={`text-[10px] uppercase font-black tracking-widest ${status === BellStatus.BREAK || isLongCountdown ? 'text-indigo-500' : 'text-slate-500'}`}>
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
                <div className={`w-full rounded-[2rem] p-5 flex items-center justify-between border transition-all overflow-hidden relative ${isDarkMode ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-white border-slate-100 shadow-sm'}`}>
                  {lessonData.next.isNextLast && (
                    <div className={`absolute inset-0 pointer-events-none opacity-[0.05] ${isDarkMode ? 'finish-pattern-dark' : 'finish-pattern'}`} />
                  )}
                  
                  <div className="flex flex-col items-start relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                       <div className="w-5 h-5 rounded-md bg-slate-500/10 flex items-center justify-center text-[8px] font-black text-slate-500 border border-slate-500/20">
                          {lessonData.next.num}
                       </div>
                       <span className="text-[9px] uppercase font-black text-indigo-500/70 tracking-widest">შემდეგი</span>
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

      <a 
        href="https://onlineschool.emis.ge/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`w-full max-w-2xl mb-12 p-6 rounded-[2rem] border flex items-center justify-between group transition-all transform active:scale-95 ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20' : 'bg-white border-slate-200 shadow-md hover:shadow-lg'}`}
      >
        <div className="flex items-center gap-5">
           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 ${theme.accent}`}>
             <BookOpenCheck size={28} />
           </div>
           <div className="flex flex-col text-left">
              <span className={`text-xl font-black tracking-tight ${theme.head}`}>ნიშნების ნახვა</span>
              <span className={`text-[10px] uppercase font-black ${isDarkMode ? 'text-indigo-400/70' : 'text-indigo-600/70'}`}>ონლაინ სკოლის პორტალი</span>
           </div>
        </div>
        <ExternalLink size={18} className="text-slate-400 transition-transform group-hover:scale-110" />
      </a>

      <section className="w-full mb-16">
        <h2 className={`text-3xl font-black mb-8 px-2 ${theme.head}`}>გაკვეთილების ცხრილი (10-1)</h2>
        <div className={`rounded-[2.5rem] border overflow-hidden overflow-x-auto transition-all ${theme.card}`}>
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className={`border-b ${theme.border} ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                <th className="p-6 text-slate-500 font-black text-[10px] uppercase w-20 text-center">#</th>
                <th className="p-6 text-slate-500 font-black text-[10px] uppercase text-left">დრო</th>
                {WEEKDAYS_GE.slice(1,6).map((day, i) => (
                  <th key={i} className={`p-6 text-slate-500 font-black text-[10px] uppercase tracking-widest ${tbilisiTimeData.day === i+1 ? 'text-indigo-500' : ''}`}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BELL_TIMES.map((bell, bi) => (
                <tr key={bi} className={`border-b ${theme.border} last:border-none transition-colors ${currentPeriod === bi+1 && !isLongCountdown ? (isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50/50') : 'hover:bg-indigo-500/[0.02]'}`}>
                  <td className="p-6 text-center font-black text-slate-500 text-lg">{bell.period}</td>
                  <td className="p-6 whitespace-nowrap text-left">
                    <div className="font-black text-base">{bell.start}</div>
                    <div className="text-xs text-slate-500 font-bold">{bell.end}</div>
                  </td>
                  {[1,2,3,4,5].map(d => {
                    const l = LESSON_SCHEDULE[d][bi];
                    const isHolidayToday = holidayStatusByDay[d];
                    return (
                      <td key={d} className={`p-6 ${tbilisiTimeData.day === d ? (isDarkMode ? 'bg-white/5' : 'bg-slate-50/40') : ''} ${isHolidayToday ? 'opacity-30' : ''}`}>
                        {l ? (
                          <div className="text-left">
                            <div className={`text-sm font-black ${isHolidayToday ? 'line-through' : ''}`}>{l.subject}</div>
                            <div className="text-[10px] text-slate-500 font-bold mt-0.5">{l.teacher}</div>
                          </div>
                        ) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {nextHolidayInfo && (
        <section className="w-full max-w-4xl mb-20">
          <div className={`p-8 md:p-10 rounded-[2.5rem] border flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100 shadow-xl shadow-indigo-500/5'}`}>
            <div className="flex items-center gap-6 text-left">
               <div className="w-20 h-20 rounded-3xl bg-indigo-500 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30">
                 <BellRing size={40} className="animate-pulse" />
               </div>
               <div>
                 <h3 className={`text-2xl font-black ${theme.head}`}>შემდეგი დასვენება</h3>
                 <p className="text-indigo-500 font-black text-xl flex items-center gap-2">
                   <ArrowRight size={18} /> {nextHolidayInfo.name}
                 </p>
               </div>
            </div>
            <div className="text-center md:text-right">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl md:text-7xl font-black text-indigo-500 tabular-nums tracking-tighter">{nextHolidayInfo.days}</span>
                  <span className={`text-2xl font-black uppercase tracking-widest ${theme.sub}`}>დღეში</span>
                </div>
                <p className="text-xs font-bold opacity-60 uppercase tracking-widest">{nextHolidayInfo.date.toLocaleDateString('ka-GE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </section>
      )}

      <section className="w-full mb-24">
        <div className="flex flex-col items-center mb-12">
            <h2 className={`text-4xl md:text-5xl font-black tracking-tight text-center ${theme.head}`}>2026 წლის უქმე დღეები</h2>
            <p className={`mt-2 ${theme.sub} font-bold opacity-70`}>არდადეგები და სახელმწიფო დასვენებები</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
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
              acc.push({ start: curr.day, end: curr.day, name: curr.name });
              return acc;
            }, []);

            return (
              <div key={monthName} className={`p-8 rounded-[3rem] border transition-all ${theme.card} ${isCurr ? 'ring-4 ring-indigo-500/20' : ''}`}>
                <h3 className={`font-black text-3xl mb-8 ${isCurr ? 'text-indigo-500' : theme.head}`}>{monthName}</h3>
                <div className="space-y-4">
                  {holidayGroups.map((g: any, i: number) => (
                    <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${theme.holidayCard} ${theme.border}`}>
                       <div className={`w-14 h-12 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 shadow-lg ${g.end > g.start ? 'bg-indigo-500 text-white' : 'bg-red-500 text-white shadow-red-500/20'}`}>
                        <span className="text-sm leading-none">{g.start}</span>
                        {g.end > g.start && (
                          <><div className="w-1/2 h-[1px] bg-white/30 my-0.5" /><span className="text-sm leading-none">{g.end}</span></>
                        )}
                       </div>
                       <div className="flex flex-col min-w-0">
                          <span className={`font-black text-sm truncate ${theme.head}`}>{g.name}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{g.end > g.start ? 'არდადეგები' : 'დასვენება'}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="text-center py-20 border-t w-full border-slate-200/10">
        <p className="text-[11px] font-black tracking-[0.6em] mb-2 opacity-40">DESIGNED BY SMILE B</p>
        <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">© 2026. 10-1 კლასის სასკოლო პორტალი</p>
      </footer>
    </div>
  );
};

export default App;