import { Calendar, ChevronRight, Clock, Coffee, GraduationCap, Info, LayoutGrid, Moon, PartyPopper, Sun } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { BELL_TIMES, HOLIDAYS_2026, LESSON_SCHEDULE, WEEKDAYS_GE } from './constants';
import { BellStatus } from './types';

const BELL_DELAY_SECONDS = 105; // 1 minute and 45 seconds

const MONTH_NAMES_GE = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"
];

const App: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync theme with document class for Tailwind (if needed, but using inline classes mostly)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('bg-zinc-950');
      document.documentElement.classList.remove('bg-slate-50');
    } else {
      document.documentElement.classList.add('bg-slate-50');
      document.documentElement.classList.remove('bg-zinc-950');
    }
  }, [isDarkMode]);

  // Use Intl.DateTimeFormat to get the exact time in Tbilisi regardless of user location
  const tbilisiTimeData = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tbilisi',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const parts = formatter.formatToParts(now);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';

    const year = parseInt(getPart('year'));
    const month = getPart('month');
    const date = getPart('day');
    const hour = parseInt(getPart('hour'));
    const minute = parseInt(getPart('minute'));
    const second = parseInt(getPart('second'));
    
    const tbilisiNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tbilisi' }));
    const day = tbilisiNow.getDay();

    return { day, month, date, hour, minute, second, year, todayStr: `${month}-${date}` };
  }, [now]);

  const { status, nextBellIn, delayIn, currentPeriod, nextEventLabel, isHoliday } = useMemo(() => {
    const { day, todayStr, hour, minute, second } = tbilisiTimeData;
    
    const isHoliday = HOLIDAYS_2026.includes(todayStr);

    if (day === 0 || day === 6 || isHoliday) {
      return { 
        status: BellStatus.WEEKEND, 
        nextBellIn: null, 
        delayIn: null,
        currentPeriod: 0, 
        nextEventLabel: isHoliday ? 'დღეს უქმე დღეა' : 'დასვენება',
        isHoliday
      };
    }

    const currentTimeInSeconds = hour * 3600 + minute * 60 + second;

    const firstLessonStart = BELL_TIMES[0].start.split(':').map(Number);
    const startOfDaySecs = firstLessonStart[0] * 3600 + firstLessonStart[1] * 60;
    
    const lastLessonEnd = BELL_TIMES[BELL_TIMES.length - 1].end.split(':').map(Number);
    const endOfDaySecs = lastLessonEnd[0] * 3600 + lastLessonEnd[1] * 60;

    if (currentTimeInSeconds < startOfDaySecs) {
      return { 
        status: BellStatus.BEFORE_SCHOOL, 
        nextBellIn: startOfDaySecs - currentTimeInSeconds,
        delayIn: null,
        currentPeriod: 0,
        nextEventLabel: 'პირველი გაკვეთილის დაწყებამდე',
        isHoliday
      };
    }

    if (currentTimeInSeconds > endOfDaySecs + BELL_DELAY_SECONDS) {
      return { 
        status: BellStatus.AFTER_SCHOOL, 
        nextBellIn: null, 
        delayIn: null,
        currentPeriod: 0, 
        nextEventLabel: 'სკოლა დასრულდა',
        isHoliday
      };
    }

    for (let i = 0; i < BELL_TIMES.length; i++) {
      const b = BELL_TIMES[i];
      const start = b.start.split(':').map(Number);
      const end = b.end.split(':').map(Number);
      const startSecs = start[0] * 3600 + start[1] * 60;
      const endSecs = end[0] * 3600 + end[1] * 60;

      if (currentTimeInSeconds >= startSecs && currentTimeInSeconds < endSecs) {
        return { 
          status: BellStatus.LESSON, 
          nextBellIn: endSecs - currentTimeInSeconds,
          delayIn: null,
          currentPeriod: i + 1,
          nextEventLabel: 'გაკვეთილის დასრულებამდე',
          isHoliday
        };
      }

      if (currentTimeInSeconds >= endSecs && currentTimeInSeconds < endSecs + BELL_DELAY_SECONDS) {
        return {
          status: BellStatus.LESSON,
          nextBellIn: 0,
          delayIn: (endSecs + BELL_DELAY_SECONDS) - currentTimeInSeconds,
          currentPeriod: i + 1,
          nextEventLabel: 'ზარის მოლოდინი (დაგვიანება)',
          isHoliday
        };
      }

      if (i < BELL_TIMES.length - 1) {
        const nextB = BELL_TIMES[i + 1];
        const nextStart = nextB.start.split(':').map(Number);
        const nextStartSecs = nextStart[0] * 3600 + nextStart[1] * 60;

        if (currentTimeInSeconds >= endSecs + BELL_DELAY_SECONDS && currentTimeInSeconds < nextStartSecs) {
           return { 
              status: BellStatus.BREAK, 
              nextBellIn: nextStartSecs - currentTimeInSeconds,
              delayIn: null,
              currentPeriod: i + 1,
              nextEventLabel: 'დასვენების დასრულებამდე',
              isHoliday
            };
        }

        if (currentTimeInSeconds >= nextStartSecs && currentTimeInSeconds < nextStartSecs + BELL_DELAY_SECONDS) {
          return {
            status: BellStatus.BREAK,
            nextBellIn: 0,
            delayIn: (nextStartSecs + BELL_DELAY_SECONDS) - currentTimeInSeconds,
            currentPeriod: i + 1,
            nextEventLabel: 'ზარის მოლოდინი (გაკვეთილის დასაწყისი)',
            isHoliday
          };
        }
      }
    }

    return { status: BellStatus.AFTER_SCHOOL, nextBellIn: null, delayIn: null, currentPeriod: 0, nextEventLabel: 'დასრულდა', isHoliday };
  }, [tbilisiTimeData]);

  const formatTimeRemaining = (seconds: number | null) => {
    if (seconds === null) return '00:00';
    const s = Math.ceil(seconds);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentLesson = useMemo(() => {
    const { day } = tbilisiTimeData;
    const daySchedule = LESSON_SCHEDULE[day];
    if (daySchedule && currentPeriod > 0) {
      return daySchedule[currentPeriod - 1];
    }
    return null;
  }, [tbilisiTimeData, currentPeriod]);

  const nextLesson = useMemo(() => {
    const { day } = tbilisiTimeData;
    const daySchedule = LESSON_SCHEDULE[day];
    if (daySchedule && currentPeriod > 0 && currentPeriod < daySchedule.length) {
      return daySchedule[currentPeriod];
    }
    return null;
  }, [tbilisiTimeData, currentPeriod]);

  // Grouped Holidays for the Grid
  const holidaysByMonth = useMemo(() => {
    const groups: Record<number, number[]> = {};
    HOLIDAYS_2026.forEach(h => {
      const [m, d] = h.split('-').map(Number);
      if (!groups[m]) groups[m] = [];
      groups[m].push(d);
    });
    return groups;
  }, []);

  const holidayStatusByDay = useMemo(() => {
    const statuses: Record<number, boolean> = {};
    const { day: currentDayOfWeek, year, month, date } = tbilisiTimeData;
    const today = new Date(year, parseInt(month) - 1, parseInt(date));
    const diffToMonday = (currentDayOfWeek === 0 ? 7 : currentDayOfWeek) - 1;
    const mondayOfThisWeek = new Date(today);
    mondayOfThisWeek.setDate(today.getDate() - diffToMonday);

    for (let i = 0; i < 5; i++) {
      const targetDate = new Date(mondayOfThisWeek);
      targetDate.setDate(mondayOfThisWeek.getDate() + i);
      const m = (targetDate.getMonth() + 1).toString().padStart(2, '0');
      const d = targetDate.getDate().toString().padStart(2, '0');
      const dateStr = `${m}-${d}`;
      statuses[i + 1] = HOLIDAYS_2026.includes(dateStr);
    }
    return statuses;
  }, [tbilisiTimeData]);

  const themeClasses = {
    bg: isDarkMode ? 'bg-zinc-950 text-slate-100' : 'bg-slate-50 text-slate-900',
    card: isDarkMode ? 'bg-zinc-900 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-lg',
    subText: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    headerText: isDarkMode ? 'text-white' : 'text-slate-900',
    muted: isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200',
    tableBorder: isDarkMode ? 'border-white/5' : 'border-slate-100',
    tableHeader: isDarkMode ? 'bg-white/5' : 'bg-slate-50',
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeClasses.bg} p-4 md:p-8 flex flex-col items-center max-w-7xl mx-auto selection:bg-indigo-500 selection:text-white`}>
      {/* Theme Toggle & Header */}
      <div className="w-full flex justify-end mb-4">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-zinc-800 text-amber-400 hover:bg-zinc-700' : 'bg-white text-indigo-600 shadow-md hover:shadow-lg'}`}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <header className="w-full text-center mb-10">
        <h1 className={`text-4xl md:text-6xl font-black mb-2 tracking-tight ${themeClasses.headerText}`}>
          ზარი რამდენ ხანშია?
        </h1>
        <p className={`${themeClasses.subText} flex items-center justify-center gap-2 font-medium`}>
          <Calendar size={18} className="text-indigo-400" />
          {WEEKDAYS_GE[tbilisiTimeData.day]}, {tbilisiTimeData.hour.toString().padStart(2, '0')}:{tbilisiTimeData.minute.toString().padStart(2, '0')} (თბილისი)
        </p>
      </header>

      {/* Main Countdown Card */}
      <main className={`w-full max-w-2xl rounded-[2.5rem] border p-8 md:p-12 mb-12 text-center relative overflow-hidden transition-all ${themeClasses.card}`}>
        <div className={`absolute top-0 left-0 w-full h-1.5 transition-colors duration-500 ${
          delayIn !== null ? 'bg-amber-500 animate-pulse' :
          status === BellStatus.LESSON ? 'bg-indigo-500' : 
          status === BellStatus.BREAK ? 'bg-emerald-500' : 
          'bg-slate-700'
        }`} />

        <div className="flex flex-col items-center">
          <span className={`px-4 py-1.5 rounded-full text-xs font-black mb-6 flex items-center gap-2 uppercase tracking-widest ${
            delayIn !== null ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
            status === BellStatus.LESSON ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
            status === BellStatus.BREAK ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
            'bg-slate-800 text-slate-400'
          }`}>
            {delayIn !== null ? <Clock size={14} className="animate-spin-slow" /> : 
             status === BellStatus.LESSON ? <GraduationCap size={16} /> : 
             status === BellStatus.BREAK ? <Coffee size={16} /> :
             isHoliday ? <PartyPopper size={16} /> : <Calendar size={16} />}
            
            {delayIn !== null ? 'ზარი აგვიანებს' :
             status === BellStatus.LESSON ? 'მიმდინარეობს გაკვეთილი' : 
             status === BellStatus.BREAK ? 'დასვენება' : 
             status === BellStatus.WEEKEND ? 'დასვენების დღე' : 'სკოლის გარეშე'}
          </span>

          <div className={`text-7xl md:text-9xl font-black tabular-nums tracking-tighter mb-4 ${
            delayIn !== null ? 'text-amber-400' : themeClasses.headerText
          }`}>
            {delayIn !== null ? formatTimeRemaining(delayIn) : formatTimeRemaining(nextBellIn)}
          </div>

          <p className={`${themeClasses.subText} font-bold mb-4 text-xl`}>
            {nextEventLabel}
          </p>

          <div className={`flex items-center gap-2 text-[10px] md:text-xs px-3 py-1.5 rounded-xl mb-8 border transition-colors ${themeClasses.muted}`}>
            <Info size={14} className="text-indigo-400 flex-shrink-0" />
            <span>სკოლაში ზარი აგვიანებს 1:45 წუთით</span>
          </div>

          {currentLesson && (
            <div className={`w-full rounded-3xl p-6 flex flex-col items-center border transition-all group lesson-card ${themeClasses.muted} hover:border-indigo-500/30`}>
              <span className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black mb-1">ახლა გვაქვს</span>
              <h3 className={`text-2xl font-black group-hover:text-indigo-400 transition-colors ${themeClasses.headerText}`}>{currentLesson.subject}</h3>
              <p className={`${themeClasses.subText} font-bold mt-1`}>{currentLesson.teacher}</p>
              
              {nextLesson && (
                <div className={`mt-4 pt-4 border-t w-full ${themeClasses.tableBorder}`}>
                  <span className="text-slate-500 text-[9px] uppercase tracking-[0.1em] font-bold block mb-1 opacity-60">შემდეგი გაკვეთილი</span>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{nextLesson.subject}</span>
                    <span className="text-[10px] text-slate-500">({nextLesson.teacher})</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Lesson Schedule Table */}
      <section className="w-full mb-16">
        <div className="flex items-center gap-3 mb-6">
          <LayoutGrid className="text-indigo-500" size={24} />
          <h2 className={`text-2xl font-black tracking-tight ${themeClasses.headerText}`}>გაკვეთილების ცხრილი (10-1)</h2>
        </div>
        
        <div className={`rounded-[2rem] border overflow-hidden overflow-x-auto scrollbar-thin transition-all ${themeClasses.card}`}>
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className={`${themeClasses.tableHeader} border-b ${themeClasses.tableBorder}`}>
                <th className="p-5 text-slate-500 font-black text-[10px] uppercase text-center w-16">#</th>
                <th className="p-5 text-slate-500 font-black text-[10px] uppercase">დრო</th>
                {WEEKDAYS_GE.slice(1, 6).map((day, idx) => {
                  const isToday = tbilisiTimeData.day === idx + 1;
                  const isHolidayThisDay = holidayStatusByDay[idx + 1];
                  return (
                    <th key={day} className={`p-5 text-slate-500 font-black text-[10px] uppercase tracking-widest ${isToday ? 'text-indigo-500' : ''} ${isHolidayThisDay ? 'text-red-500' : ''}`}>
                      {day} {isHolidayThisDay ? '(უქმე)' : ''}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {BELL_TIMES.map((bell, bIdx) => (
                <tr key={bell.period} className={`border-b ${themeClasses.tableBorder} last:border-none transition-colors ${currentPeriod === bIdx + 1 ? (isDarkMode ? 'bg-indigo-500/5' : 'bg-indigo-50') : 'hover:bg-indigo-500/[0.02]'}`}>
                  <td className="p-5 text-center font-black text-slate-500">{bell.period}</td>
                  <td className="p-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`font-black text-sm ${themeClasses.headerText}`}>{bell.start}</span>
                      <span className="text-slate-500 text-[10px] font-bold">{bell.end}</span>
                    </div>
                  </td>
                  {[1, 2, 3, 4, 5].map((dayNum) => {
                    const lesson = LESSON_SCHEDULE[dayNum][bIdx];
                    const isToday = tbilisiTimeData.day === dayNum;
                    const isHolidayThisDay = holidayStatusByDay[dayNum];
                    const isActive = isToday && currentPeriod === bIdx + 1 && status === BellStatus.LESSON;
                    
                    return (
                      <td key={dayNum} className={`p-5 ${isToday ? (isDarkMode ? 'bg-indigo-500/[0.02]' : 'bg-indigo-50/30') : ''} ${isHolidayThisDay ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                        {lesson ? (
                          <div className={`flex flex-col transition-all ${isActive ? 'translate-x-1' : ''}`}>
                            <span className={`text-sm font-black ${isActive ? 'text-indigo-500' : isHolidayThisDay ? 'text-red-500' : (isDarkMode ? 'text-slate-200' : 'text-slate-800')}`}>
                              {lesson.subject}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
                              {lesson.teacher}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2026 Holidays Grid */}
      <section className="w-full mb-16">
        <div className="flex items-center gap-3 mb-8">
          <PartyPopper className="text-red-500" size={24} />
          <h2 className={`text-2xl font-black tracking-tight ${themeClasses.headerText}`}>2026 წლის უქმე დღეები</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MONTH_NAMES_GE.map((monthName, idx) => {
            const monthNum = idx + 1;
            const holidays = holidaysByMonth[monthNum] || [];
            const isCurrentMonth = parseInt(tbilisiTimeData.month) === monthNum;

            return (
              <div key={monthName} className={`p-6 rounded-[2rem] border transition-all ${themeClasses.card} ${isCurrentMonth ? 'ring-2 ring-indigo-500/20 shadow-indigo-500/10' : ''}`}>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-500/10">
                  <h3 className={`font-black text-lg ${isCurrentMonth ? 'text-indigo-500' : themeClasses.headerText}`}>
                    {monthName}
                  </h3>
                  {isCurrentMonth && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                </div>
                
                {holidays.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {holidays.map(day => (
                      <div 
                        key={day} 
                        className={`aspect-square flex items-center justify-center rounded-xl font-black text-sm border bg-red-500/10 border-red-500/20 text-red-500`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black py-2">უქმეები არაა</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <footer className={`w-full text-center py-12 border-t transition-colors ${themeClasses.tableBorder} flex flex-col items-center gap-4`}>
        <div className="flex flex-col items-center">
            <p className="text-[10px] font-black text-slate-500 opacity-60 tracking-[0.5em] mb-1">DESIGNED BY</p>
            <p className="text-2xl font-black text-indigo-500 tracking-tighter">©️ Smile B</p>
        </div>
        <p className={`text-[10px] uppercase tracking-[0.3em] font-bold ${themeClasses.subText}`}>© 2026 10-1 კლასის სასკოლო პორტალი</p>
      </footer>

      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
      `}</style>
    </div>
  );
};

export default App;
