'use client';

import React, { useState } from 'react';

interface AttendanceSectionProps {
    member: any;
    primaryColor: string;
}

export const AttendanceSection: React.FC<AttendanceSectionProps> = ({ member, primaryColor }) => {
    const [viewDate, setViewDate] = useState(new Date()); // Month being viewed

    // Pre-calculate attendance dates for O(1) lookup in the render loop
    const attendanceDatesSet = React.useMemo(() => {
        return new Set(
            (member.attendance || []).map((v: any) => new Date(v.checked_in_at).toDateString())
        );
    }, [member.attendance]);

    // Memoize the calendar grid to avoid recalculating on every render
    const days = React.useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const daysArray = [];

        // Monday start logic
        let startingDay = firstDay.getDay();
        startingDay = startingDay === 0 ? 6 : startingDay - 1;

        for (let i = 0; i < startingDay; i++) {
            const prevDay = new Date(year, month, 1 - (startingDay - i));
            daysArray.push({ date: prevDay, currentMonth: false });
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            daysArray.push({ date: new Date(year, month, i), currentMonth: true });
        }

        const totalCells = Math.ceil(daysArray.length / 7) * 7;
        const remaining = totalCells - daysArray.length;
        for (let i = 1; i <= remaining; i++) {
            daysArray.push({ date: new Date(year, month + 1, i), currentMonth: false });
        }

        return daysArray;
    }, [viewDate]);

    const monthName = React.useMemo(() =>
        viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        [viewDate]);

    const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    const changeMonth = (offset: number) => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const todayDateStr = React.useMemo(() => new Date().toDateString(), []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="grid grid-cols-2 gap-4">
                <div className="stat-card text-center">
                    <div className="text-3xl font-black text-white">{member.visitsThisWeek}</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest font-black mt-1">Esta Semana</div>
                </div>
                <div className="stat-card text-center">
                    <div className="text-3xl font-black text-white">{member.visitsThisMonth}</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest font-black mt-1">Este Mes</div>
                </div>
            </div>

            <div className="glass-card !p-6">
                {/* Calendar Header with Navigation */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xs font-black uppercase text-white/40 tracking-[0.2em]">{monthName}</h3>
                        <p className="text-[8px] text-white/20 uppercase font-black mt-1 tracking-widest">Asistencias registradas</p>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="p-4 -m-2 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 active:scale-90 transition-all outline-none border border-white/5 touch-none select-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <button
                            onClick={() => changeMonth(1)}
                            className="p-4 -m-2 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 active:scale-90 transition-all outline-none border border-white/5 touch-none select-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>
                </div>

                {/* Week Day Labels */}
                <div className="grid grid-cols-7 mb-4 border-b border-white/5 pb-2">
                    {weekDays.map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-black text-white/20 uppercase">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                    {days.map((item, i) => {
                        const { date, currentMonth } = item;
                        const dateString = date.toDateString();
                        const hasVisited = attendanceDatesSet.has(dateString);

                        return (
                            <div
                                key={`${date.getTime()}-${i}`}
                                className={`flex flex-col items-center select-none touch-manipulation group ${!currentMonth ? 'opacity-20' : ''}`}
                            >
                                <div
                                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center relative transition-all duration-300
                                        ${hasVisited ? 'shadow-[0_0_15px]' : 'bg-white/[0.03]'}
                                    `}
                                    style={hasVisited ? { background: primaryColor, boxShadow: `0 0 15px ${primaryColor}60` } : {}}
                                >
                                    <div
                                        className={`w-1.5 h-1.5 rounded-full ${hasVisited ? 'bg-white shadow-[0_0_5px_white]' : 'bg-white/10'}`}
                                    />

                                    {dateString === todayDateStr && (
                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#0A0A0A]" title="Hoy" />
                                    )}
                                </div>
                                <span className={`text-[8px] mt-2 font-black tracking-tighter transition-colors ${currentMonth ? 'text-white/40' : 'text-white/10'}`}>
                                    {date.getDate()}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/20 ml-1">Check-ins Recientes</h3>
                <div className="space-y-3">
                    {member.attendance?.slice(0, 5).map((visit: any) => (
                        <div key={visit.id} className="glass-card !p-4 flex items-center justify-between group hover:bg-white/[0.04] transition-all border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                                <div>
                                    <div className="text-[13px] font-black text-white uppercase tracking-tight">
                                        {new Date(visit.checked_in_at).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })}
                                    </div>
                                    <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
                                        Hora: {new Date(visit.checked_in_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <div className="text-[8px] font-black text-green-400/50 uppercase tracking-[0.2em] bg-green-400/5 px-2 py-1 rounded-lg border border-green-400/10">Entrada OK</div>
                        </div>
                    ))}
                    {!member.attendance?.length && (
                        <div className="text-center py-10 glass-card bg-white/[0.02] border border-dashed border-white/10 text-white/20 text-[10px] font-black uppercase tracking-widest">Aún no hay registros de asistencia</div>
                    )}
                </div>
            </div>
        </div>
    );
};
