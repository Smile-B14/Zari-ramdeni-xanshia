import { Calendar, ChevronRight, Clock, Coffee, GraduationCap, Info, LayoutGrid, Moon, PartyPopper, Sun, ArrowRight, BellRing, BellOff, Bell } from 'lucide-react';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { BELL_TIMES, HOLIDAYS_2026, LESSON_SCHEDULE, WEEKDAYS_GE, HOLIDAY_NAMES_GE } from './constants';
import { BellStatus } from './types';

const BELL_DELAY_SECONDS = 105; // 1 minute and 45 seconds

const MONTH_NAMES_GE = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"
];

const App: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notifications_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const lastNotifiedPeriod = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('notifications_enabled', JSON.stringify(notificationsEnabled));
    if (notificationsEnabled && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [notificationsEnabled]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('bg-zinc-950');
      document.documentElement.classList.remove('bg-slate-50');
    } else {
      document.documentElement.classList.add('bg-slate-50');
      document.documentElement.classList.remove('bg-zinc-950');
    }
  }, [isDarkMode]);

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

  // Notification Logic
  useEffect(() => {
    if (notificationsEnabled && Notification.permission === 'granted' && status === BellStatus.LESSON && nextBellIn === 60) {
      if (lastNotifiedPeriod.current !== currentPeriod) {
        new Notification('ზარი 1 წუთშია!', {
          body: 'გაკვეთილი მალე სრულდება. მოემზადეთ!',
          icon: 'https://img.icons8.com/fluency/240/school-bell.png'
        });
        lastNotifiedPeriod.current = currentPeriod;
      }
    }
    // Reset tracker if status changes
    if (status !== BellStatus.LESSON) {
      lastNotifiedPeriod.current = null;
    }
  }, [nextBellIn, status, notificationsEnabled, currentPeriod]);

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

  const holidaysByMonth = useMemo(() => {
    const groups: Record<number, { day: number, name: string }[]> = {};
    HOLIDAYS_2026.forEach(h => {
      const [m, d] = h.split('-').map(Number);
      if (!groups[m]) groups[m] = [];
      groups[m].push({ day: d, name: HOLIDAY_NAMES_GE[h] || 'უქმე დღე' });
    });
    return groups;
  }, []);

  const nextHolidayInfo = useMemo(() => {
    const { year, month: curM, date: curD } = tbilisiTimeData;
    const today = new Date(year, parseInt(curM) - 1, parseInt(curD));
    
    const sortedHolidays = [...HOLIDAYS_2026].sort().map(h => {
        const [m, d] = h.split('-').map(Number);
        return { date: new Date(year, m - 1, d), name: HOLIDAY_NAMES_GE[h] || 'უქმე დღე' };
    });

    const next = sortedHolidays.find(h => h.date >= today);
    if (!next) return null;

    const diffTime = next.date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return { days: diffDays, name: next.name, date: next.date };
  }, [tbilisiTimeData]);

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
    holidayCard: isDarkMode ? 'bg-zinc-900/50 hover:bg-zinc-900' : 'bg-white hover:bg-slate-50',
  };

  const toggleNotifications = () => {
    if (!notificationsEnabled) {
      if (Notification.permission === 'denied') {
        alert('გთხოვთ ჩართოთ ნოტიფიკაციები ბრაუზერის პარამეტრებიდან.');
        return;
      }
    }
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeClasses.bg} p-4 md:p-8 flex flex-col items-center max-w-7xl mx-auto selection:bg-indigo-500 selection:text-white`}>
      {/* Settings Bar */}
      <div className="w-full flex justify-end gap-3 mb-6">
        <button 
          onClick={toggleNotifications}
          className={`p-3.5 rounded-2xl transition-all flex items-center gap-2 font-bold text-xs ${notificationsEnabled ? 'bg-indigo-500/10 text-indigo-500' : 'bg-zinc-800 text-slate-500'}`}
          aria-label="Toggle Notifications"
        >
          {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
          <span className="hidden sm:inline">{notificationsEnabled ? 'ნოტიფიკაციები ჩართულია' : 'ნოტიფიკაციები გამორთულია'}</span>
        </button>

        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-3.5 rounded-2xl transition-all ${isDarkMode ? 'bg-zinc-800 text-amber-400 hover:bg-zinc-700' : 'bg-white text-indigo-600 shadow-md hover:shadow-lg'}`}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <header className="w-full text-center mb-10">
        <h1 className={`text-4xl md:text-7xl font-black mb-2 tracking-tight ${themeClasses.headerText}`}>
          ზარი რამდენ ხანშია?
        </h1>
        <p className={`${themeClasses.subText} flex items-center justify-center gap-2 font-medium text-lg`}>
          <Calendar size={20} className="text-indigo-400" />
          {WEEKDAYS_GE[tbilisiTimeData.day]}, {tbilisiTimeData.hour.toString().padStart(2, '0')}:{tbilisiTimeData.minute.toString().padStart(2, '0')} (თბილისი)
        </p>
      </header>

      {/* Main Countdown Card */}
      <main className={`w-full max-w-2xl rounded-[3rem] border p-8 md:p-14 mb-12 text-center relative overflow-hidden transition-all ${themeClasses.card}`}>
        <div className={`absolute top-0 left-0 w-full h-2 transition-colors duration-500 ${
          delayIn !== null ? 'bg-amber-500 animate-pulse' :
          status === BellStatus.LESSON ? 'bg-indigo-500' : 
          status === BellStatus.BREAK ? 'bg-emerald-500' : 
          'bg-slate-700'
        }`} />

        <div className="flex flex-col items-center">
          <span className={`px-5 py-2 rounded-full text-[10px] font-black mb-8 flex items-center gap-2 uppercase tracking-[0.2em] ${
            delayIn !== null ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
            status === BellStatus.LESSON ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
            status === BellStatus.BREAK ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
            'bg-slate-800 text-slate-400'
          }`}>
            {delayIn !== null ? <Clock size={16} className="animate-spin-slow" /> : 
             status === BellStatus.LESSON ? <GraduationCap size={18} /> : 
             status === BellStatus.BREAK ? <Coffee size={18} /> :
             isHoliday ? <PartyPopper size={18} /> : <Calendar size={18} />}
            
            {delayIn !== null ? 'ზარი აგვიანებს' :
             status === BellStatus.LESSON ? 'მიმდინარეობს გაკვეთილი' : 
             status === BellStatus.BREAK ? 'დასვენება' : 
             status === BellStatus.WEEKEND ? 'დასვენების დღე' : 'სკოლის გარეშე'}
          </span>

          <div className={`text-8xl md:text-[10rem] font-black tabular-nums tracking-tighter leading-none mb-6 ${
            delayIn !== null ? 'text-amber-400' : themeClasses.headerText
          }`}>
            {delayIn !== null ? formatTimeRemaining(delayIn) : formatTimeRemaining(nextBellIn)}
          </div>

          <p className={`${themeClasses.subText} font-black mb-6 text-2xl`}>
            {nextEventLabel}
          </p>

          <div className={`flex items-center gap-3 text-xs px-5 py-2.5 rounded-2xl mb-10 border transition-colors font-bold ${themeClasses.muted}`}>
            <Info size={16} className="text-indigo-500 flex-shrink-0" />
            <span>სკოლაში ზარი აგვიანებს 1:45 წუთით</span>
          </div>

          {currentLesson && (
            <div className={`w-full rounded-[2rem] p-8 flex flex-col items-center border transition-all group lesson-card ${themeClasses.muted} hover:border-indigo-500/30`}>
              <span className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black mb-2">ახლა გვაქვს</span>
              <h3 className={`text-3xl font-black group-hover:text-indigo-400 transition-colors ${themeClasses.headerText}`}>{currentLesson.subject}</h3>
              <p className={`${themeClasses.subText} font-black text-lg mt-1`}>{currentLesson.teacher}</p>
              
              {nextLesson && (
                <div className={`mt-6 pt-6 border-t w-full ${themeClasses.tableBorder}`}>
                  <span className="text-slate-500 text-[9px] uppercase tracking-[0.2em] font-black block mb-2 opacity-60">შემდეგი გაკვეთილი</span>
                  <div className="flex items-center justify-center gap-3">
                    <span className={`text-lg font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{nextLesson.subject}</span>
                    <span className="text-xs text-slate-500 font-bold opacity-70">({nextLesson.teacher})</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Lesson Schedule Table */}
      <section className="w-full mb-12">
        <div className="flex items-center gap-3 mb-8">
          <LayoutGrid className="text-indigo-500" size={28} />
          <h2 className={`text-3xl font-black tracking-tight ${themeClasses.headerText}`}>გაკვეთილების ცხრილი (10-1)</h2>
        </div>
        
        <div className={`rounded-[2.5rem] border overflow-hidden overflow-x-auto scrollbar-thin transition-all ${themeClasses.card}`}>
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className={`${themeClasses.tableHeader} border-b ${themeClasses.tableBorder}`}>
                <th className="p-6 text-slate-500 font-black text-[10px] uppercase text-center w-20">#</th>
                <th className="p-6 text-slate-500 font-black text-[10px] uppercase">დრო</th>
                {WEEKDAYS_GE.slice(1, 6).map((day, idx) => {
                  const isToday = tbilisiTimeData.day === idx + 1;
                  const isHolidayThisDay = holidayStatusByDay[idx + 1];
                  return (
                    <th key={day} className={`p-6 text-slate-500 font-black text-[10px] uppercase tracking-widest ${isToday ? 'text-indigo-500' : ''} ${isHolidayThisDay ? 'text-red-500' : ''}`}>
                      {day} {isHolidayThisDay ? '(უქმე)' : ''}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {BELL_TIMES.map((bell, bIdx) => (
                <tr key={bell.period} className={`border-b ${themeClasses.tableBorder} last:border-none transition-colors ${currentPeriod === bIdx + 1 ? (isDarkMode ? 'bg-indigo-500/5' : 'bg-indigo-50') : 'hover:bg-indigo-500/[0.02]'}`}>
                  <td className="p-6 text-center font-black text-slate-500 text-lg">{bell.period}</td>
                  <td className="p-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`font-black text-base ${themeClasses.headerText}`}>{bell.start}</span>
                      <span className="text-slate-500 text-xs font-bold">{bell.end}</span>
                    </div>
                  </td>
                  {[1, 2, 3, 4, 5].map((dayNum) => {
                    const lesson = LESSON_SCHEDULE[dayNum][bIdx];
                    const isToday = tbilisiTimeData.day === dayNum;
                    const isHolidayThisDay = holidayStatusByDay[dayNum];
                    const isActive = isToday && currentPeriod === bIdx + 1 && status === BellStatus.LESSON;
                    
                    return (
                      <td key={dayNum} className={`p-6 ${isToday ? (isDarkMode ? 'bg-indigo-500/[0.02]' : 'bg-indigo-50/30') : ''} ${isHolidayThisDay ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                        {lesson ? (
                          <div className={`flex flex-col transition-all ${isActive ? 'scale-105' : ''}`}>
                            <span className={`text-base font-black ${isActive ? 'text-indigo-500' : isHolidayThisDay ? 'text-red-500' : (isDarkMode ? 'text-slate-200' : 'text-slate-800')}`}>
                              {lesson.subject}
                            </span>
                            <span className="text-[11px] text-slate-500 font-bold truncate max-w-[140px] mt-0.5">
                              {lesson.teacher}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-black">—</span>
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

      {/* Next Holiday Countdown Section */}
      {nextHolidayInfo && (
        <section className="w-full max-w-4xl mb-20 px-4">
          <div className={`p-8 md:p-10 rounded-[2.5rem] border flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200 shadow-xl shadow-indigo-500/5'}`}>
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <PartyPopper size={120} className="text-indigo-500" />
            </div>
            
            <div className="flex items-center gap-6">
               <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-indigo-500 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 shrink-0">
                  <BellRing size={40} className="animate-bounce-slow" />
               </div>
               <div className="flex flex-col">
                  <h3 className={`text-2xl md:text-3xl font-black ${themeClasses.headerText} tracking-tight`}>
                    შემდეგი დასვენება
                  </h3>
                  <p className="text-indigo-500 font-black text-lg md:text-xl flex items-center gap-2 mt-1">
                    <ArrowRight size={20} />
                    {nextHolidayInfo.name}
                  </p>
               </div>
            </div>

            <div className="text-center md:text-right shrink-0">
                <div className="flex items-baseline justify-center md:justify-end gap-2">
                    <span className="text-6xl md:text-7xl font-black text-indigo-500 tracking-tighter tabular-nums">
                        {nextHolidayInfo.days}
                    </span>
                    <span className={`text-2xl font-black uppercase tracking-widest ${themeClasses.subText}`}>დღეში</span>
                </div>
                <p className={`text-xs font-bold opacity-60 uppercase tracking-[0.2em] mt-1 ${themeClasses.subText}`}>
                    {nextHolidayInfo.date.toLocaleDateString('ka-GE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>
          </div>
        </section>
      )}

      {/* Improved 2026 Holidays Layout */}
      <section className="w-full mb-24">
        <div className="flex flex-col items-center mb-12">
            <div className="bg-red-500/10 p-4 rounded-3xl border border-red-500/20 mb-4">
                <PartyPopper className="text-red-500" size={32} />
            </div>
            <h2 className={`text-4xl md:text-5xl font-black tracking-tight text-center ${themeClasses.headerText}`}>
                2026 წლის უქმე დღეები
            </h2>
            <p className={`mt-2 ${themeClasses.subText} font-bold opacity-70`}>ყველა სახელმწიფო დასვენება ერთ სივრცეში</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MONTH_NAMES_GE.map((monthName, idx) => {
            const monthNum = idx + 1;
            const holidays = holidaysByMonth[monthNum] || [];
            const isCurrentMonth = parseInt(tbilisiTimeData.month) === monthNum;

            if (holidays.length === 0) return null; // Only show months with holidays

            return (
              <div key={monthName} className={`p-8 rounded-[3rem] border transition-all relative overflow-hidden group ${themeClasses.card} ${isCurrentMonth ? 'ring-4 ring-indigo-500/20 shadow-2xl shadow-indigo-500/10' : ''}`}>
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full blur-3xl transition-opacity group-hover:opacity-40 ${isCurrentMonth ? 'bg-indigo-500/20' : 'bg-red-500/10 opacity-20'}`} />
                
                <div className="flex items-center justify-between mb-8 relative">
                  <h3 className={`font-black text-3xl ${isCurrentMonth ? 'text-indigo-500' : themeClasses.headerText}`}>
                    {monthName}
                  </h3>
                  <div className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isCurrentMonth ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-red-500/10 text-red-500'}`}>
                    {holidays.length} დღე
                  </div>
                </div>
                
                <div className="space-y-4 relative">
                  {holidays.map((h, i) => (
                    <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${themeClasses.holidayCard} ${isCurrentMonth && h.day === parseInt(tbilisiTimeData.date) ? 'border-indigo-500 bg-indigo-500/5' : themeClasses.tableBorder}`}>
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${isCurrentMonth && h.day === parseInt(tbilisiTimeData.date) ? 'bg-indigo-500 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}>
                        {h.day}
                       </div>
                       <div className="flex flex-col min-w-0">
                          <span className={`font-black text-sm truncate ${themeClasses.headerText}`}>{h.name}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">უქმე დღე</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className={`w-full text-center py-16 border-t transition-colors ${themeClasses.tableBorder} flex flex-col items-center gap-6`}>
        <div className="flex flex-col items-center">
            <p className="text-[11px] font-black text-slate-500 opacity-60 tracking-[0.6em] mb-2">DESIGNED BY</p>
            <div className="p-1 px-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-3xl font-black text-indigo-500 tracking-tighter">©️ Smile B</p>
            </div>
        </div>
        <div className="flex flex-col items-center gap-1">
            <p className={`text-[11px] uppercase tracking-[0.4em] font-black ${themeClasses.subText}`}>10-1 კლასის სასკოლო პორტალი</p>
            <p className="text-[9px] font-bold text-slate-500 opacity-40">2026. ყველა უფლება დაცულია.</p>
        </div>
      </footer>

      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-bounce-slow {
          animation: bounce-custom 2s infinite ease-in-out;
        }
        @keyframes bounce-custom {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #6366f1;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default App;
