import { Calendar, ChevronRight, Clock, Coffee, GraduationCap, Info, LayoutGrid, PartyPopper } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { BELL_TIMES, HOLIDAYS_2026, LESSON_SCHEDULE, WEEKDAYS_GE } from './constants';
import { BellStatus } from './types';

const BELL_DELAY_SECONDS = 105; // 1 minute and 45 seconds

const App: React.FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { status, nextBellIn, delayIn, currentPeriod, nextEventLabel, isHoliday } = useMemo(() => {
    const day = now.getDay();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const date = now.getDate().toString().padStart(2, '0');
    const todayStr = `${month}-${date}`;
    
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

    const currentTimeInSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

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

      if (currentTimeInSeconds >= startSecs && currentTimeInSeconds <= endSecs + BELL_DELAY_SECONDS) {
        if (currentTimeInSeconds <= endSecs) {
          return { 
            status: BellStatus.LESSON, 
            nextBellIn: endSecs - currentTimeInSeconds,
            delayIn: null,
            currentPeriod: i + 1,
            nextEventLabel: 'გაკვეთილის დასრულებამდე',
            isHoliday
          };
        } else {
          return {
            status: BellStatus.LESSON,
            nextBellIn: 0,
            delayIn: (endSecs + BELL_DELAY_SECONDS) - currentTimeInSeconds,
            currentPeriod: i + 1,
            nextEventLabel: 'ზარის მოლოდინი (დაგვიანება)',
            isHoliday
          };
        }
      }

      if (i < BELL_TIMES.length - 1) {
        const nextB = BELL_TIMES[i + 1];
        const nextStart = nextB.start.split(':').map(Number);
        const nextStartSecs = nextStart[0] * 3600 + nextStart[1] * 60;

        if (currentTimeInSeconds > endSecs + BELL_DELAY_SECONDS && currentTimeInSeconds < nextStartSecs + BELL_DELAY_SECONDS) {
          if (currentTimeInSeconds <= nextStartSecs) {
             return { 
                status: BellStatus.BREAK, 
                nextBellIn: nextStartSecs - currentTimeInSeconds,
                delayIn: null,
                currentPeriod: i + 1,
                nextEventLabel: 'დასვენების დასრულებამდე',
                isHoliday
              };
          } else {
            return {
              status: BellStatus.BREAK,
              nextBellIn: 0,
              delayIn: (nextStartSecs + BELL_DELAY_SECONDS) - currentTimeInSeconds,
              currentPeriod: i + 1,
              nextEventLabel: 'ზარის მოლოდინი (დაგვიანება)',
              isHoliday
            };
          }
        }
      }
    }

    return { status: BellStatus.AFTER_SCHOOL, nextBellIn: null, delayIn: null, currentPeriod: 0, nextEventLabel: 'დასრულდა', isHoliday };
  }, [now]);

  const formatTimeRemaining = (seconds: number | null) => {
    if (seconds === null) return '00:00';
    const s = Math.ceil(seconds);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentLesson = useMemo(() => {
    const day = now.getDay();
    const daySchedule = LESSON_SCHEDULE[day];
    if (daySchedule && currentPeriod > 0) {
      return daySchedule[currentPeriod - 1];
    }
    return null;
  }, [now, currentPeriod]);

  const nextLesson = useMemo(() => {
    const day = now.getDay();
    const daySchedule = LESSON_SCHEDULE[day];
    if (daySchedule && currentPeriod > 0 && currentPeriod < daySchedule.length) {
      return daySchedule[currentPeriod];
    }
    return null;
  }, [now, currentPeriod]);

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 p-4 md:p-8 flex flex-col items-center max-w-5xl mx-auto selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="w-full text-center mb-10 mt-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
          ზარი რამდენ ხანშია?
        </h1>
        <p className="text-slate-400 flex items-center justify-center gap-2">
          <Calendar size={18} className="text-indigo-400" />
          {WEEKDAYS_GE[now.getDay()]}, {now.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </header>

      {/* Main Countdown Card */}
      <main className="w-full max-w-2xl bg-zinc-900 rounded-3xl shadow-2xl border border-white/5 p-8 md:p-12 mb-12 text-center relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1.5 transition-colors duration-500 ${
          delayIn !== null ? 'bg-amber-500 animate-pulse' :
          status === BellStatus.LESSON ? 'bg-indigo-500' : 
          status === BellStatus.BREAK ? 'bg-emerald-500' : 
          'bg-slate-700'
        }`} />

        <div className="flex flex-col items-center">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold mb-6 flex items-center gap-2 uppercase tracking-widest ${
            delayIn !== null ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
            status === BellStatus.LESSON ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
            status === BellStatus.BREAK ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-100/10' :
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

          <div className={`text-7xl md:text-8xl font-black tabular-nums tracking-tighter mb-4 ${
            delayIn !== null ? 'text-amber-400' : 'text-white'
          }`}>
            {delayIn !== null ? formatTimeRemaining(delayIn) : formatTimeRemaining(nextBellIn)}
          </div>

          <p className="text-slate-400 font-medium mb-4 text-lg">
            {nextEventLabel}
          </p>

          <div className="flex items-center gap-2 text-slate-500 text-[10px] md:text-xs bg-white/5 px-3 py-1.5 rounded-lg mb-8 border border-white/5">
            <Info size={14} className="text-indigo-400 flex-shrink-0" />
            <span>სკოლაში ზარი აგვიანებს დაახლოებით 1:45 წუთით</span>
          </div>

          {currentLesson && (
            <div className="w-full bg-white/5 rounded-2xl p-6 flex flex-col items-center border border-white/5 hover:border-indigo-500/30 transition-all group lesson-card">
              <span className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black mb-1">ახლა გვაქვს</span>
              <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{currentLesson.subject}</h3>
              <p className="text-slate-400 font-medium mt-1">{currentLesson.teacher}</p>
              
              {nextLesson && (
                <div className="mt-4 pt-4 border-t border-white/5 w-full">
                  <span className="text-slate-500 text-[9px] uppercase tracking-[0.1em] font-bold block mb-1 opacity-60">შემდეგი გაკვეთილი</span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-semibold text-slate-300">{nextLesson.subject}</span>
                    <span className="text-[10px] text-slate-500">({nextLesson.teacher})</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {status === BellStatus.BREAK && currentPeriod < BELL_TIMES.length && (
            <div className="w-full bg-emerald-500/5 rounded-2xl p-6 flex flex-col items-center border border-emerald-500/10 lesson-card">
               <span className="text-emerald-500/60 text-[10px] uppercase tracking-[0.2em] font-black mb-1">შემდეგი გაკვეთილი</span>
               <h3 className="text-xl font-bold text-emerald-400">
                {LESSON_SCHEDULE[now.getDay()]?.[currentPeriod]?.subject || 'უცნობია'}
               </h3>
               <p className="text-emerald-500/40 text-[10px] mt-1 italic">მალე დაიწყება</p>
            </div>
          )}
        </div>
      </main>

      {/* Grid Visualizer */}
      <section className="w-full mb-12">
        <div className="flex items-center gap-3 mb-6">
          <LayoutGrid className="text-indigo-500" size={24} />
          <h2 className="text-2xl font-bold text-white tracking-tight">გაკვეთილების ცხრილი (10-1)</h2>
        </div>
        
        <div className="bg-zinc-900 rounded-3xl shadow-xl border border-white/5 overflow-hidden overflow-x-auto scrollbar-thin scrollbar-thumb-indigo-500">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="p-4 text-slate-500 font-bold text-[10px] uppercase text-center w-16">#</th>
                <th className="p-4 text-slate-500 font-bold text-[10px] uppercase">დრო</th>
                {WEEKDAYS_GE.slice(1, 6).map((day, idx) => (
                  <th key={day} className={`p-4 text-slate-500 font-bold text-[10px] uppercase tracking-widest ${now.getDay() === idx + 1 ? 'text-indigo-400 bg-indigo-500/10' : ''}`}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BELL_TIMES.map((bell, bIdx) => (
                <tr key={bell.period} className={`border-b border-white/5 last:border-none transition-colors ${currentPeriod === bIdx + 1 ? 'bg-indigo-500/5' : 'hover:bg-white/[0.02]'}`}>
                  <td className="p-4 text-center font-bold text-slate-600">{bell.period}</td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-slate-200 font-bold text-sm">{bell.start}</span>
                      <span className="text-slate-500 text-[10px]">{bell.end}</span>
                    </div>
                  </td>
                  {[1, 2, 3, 4, 5].map((dayNum) => {
                    const lesson = LESSON_SCHEDULE[dayNum][bIdx];
                    const isToday = now.getDay() === dayNum;
                    const isActive = isToday && currentPeriod === bIdx + 1 && status === BellStatus.LESSON;
                    
                    return (
                      <td key={dayNum} className={`p-4 ${isToday ? 'bg-indigo-500/[0.02]' : ''}`}>
                        {lesson ? (
                          <div className={`flex flex-col transition-all ${isActive ? 'translate-x-1' : ''}`}>
                            <span className={`text-sm font-bold ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}>
                              {lesson.subject}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate max-w-[130px]">
                              {lesson.teacher}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-800 text-xs">—</span>
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

      {/* Bell Grid Details */}
      <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5 shadow-sm">
          <h3 className="font-bold text-white mb-6 flex items-center gap-2">
            <Clock size={20} className="text-indigo-400" />
            I ცვლის რეჟიმი (2025-2026)
          </h3>
          <div className="space-y-3">
            {BELL_TIMES.map((b) => (
              <div key={b.period} className={`flex justify-between items-center p-3 rounded-xl border ${currentPeriod === b.period ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/5'}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black ${currentPeriod === b.period ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-slate-500'}`}>
                    {b.period}
                  </span>
                  <span className={`text-sm font-medium ${currentPeriod === b.period ? 'text-indigo-300' : 'text-slate-400'}`}>გაკვეთილი</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200 font-bold tabular-nums">
                  <span>{b.start}</span>
                  <ChevronRight size={14} className="text-slate-700" />
                  <span>{b.end}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5 shadow-sm flex flex-col justify-center items-center text-center group">
          <div className="bg-indigo-500/10 p-8 rounded-full mb-6 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all duration-500">
             <GraduationCap size={56} className="text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">სასკოლო პორტალი</h3>
          <p className="text-slate-400 max-w-xs text-sm leading-relaxed">
            ეს აპლიკაცია გეხმარებათ აკონტროლოთ დრო 10-1 კლასისთვის. <br/>
            <span className="text-indigo-400/80 mt-2 block italic text-xs">გისურვებთ წარმატებულ დღეს!</span>
          </p>
        </div>
      </section>

      <footer className="w-full text-center text-slate-600 py-8 border-t border-white/5 flex flex-col items-center gap-2">
        <p className="text-xs uppercase tracking-[0.3em] font-bold">© 2026 10-1 კლასის სასკოლო პორტალი</p>
        <div className="flex flex-col items-center">
            <p className="text-[10px] font-black text-slate-500 opacity-60 tracking-widest">DESIGNED BY</p>
            <p className="text-sm font-bold text-indigo-500/80 tracking-tighter">©️ Smile B</p>
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
      `}</style>
    </div>
  );
};

export default App;