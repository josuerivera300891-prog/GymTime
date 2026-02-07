'use client';

import React, { useState } from 'react';
import { RoutineModal, ROUTINE_TYPES } from './RoutineModal';
import { RoutineIconRenderer } from './RoutineIcons';

interface AttendanceSectionProps {
    member: any;
    primaryColor: string;
    onSaveRoutine: (routine: any) => Promise<boolean | undefined>;
}

export const AttendanceSection: React.FC<AttendanceSectionProps> = ({ member, primaryColor, onSaveRoutine }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date()); // Month being viewed

    const handleDayClick = (day: Date) => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (day <= today) {
            setSelectedDate(day);
            setIsModalOpen(true);
        }
    };

    const getRoutineForDay = (day: Date) => {
        const dateStr = day.toISOString().split('T')[0];
        return member.member_routines?.find((r: any) => r.date === dateStr);
    };

    // Calendar logic helpers
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];

        // Padding for the start of the week (assuming week starts on Monday)
        let startingDay = firstDay.getDay(); // 0 = Sun, 1 = Mon...
        startingDay = startingDay === 0 ? 6 : startingDay - 1; // Adjust to Mon=0, Sun=6

        for (let i = 0; i < startingDay; i++) {
            const prevDay = new Date(year, month, 1 - (startingDay - i));
            days.push({ date: prevDay, currentMonth: false });
        }

        // Current month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ date: new Date(year, month, i), currentMonth: true });
        }

        // Padding for the end of the week
        const totalCells = Math.ceil(days.length / 7) * 7;
        const remaining = totalCells - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(year, month + 1, i), currentMonth: false });
        }

        return days;
    };

    const days = getDaysInMonth(viewDate);
    const monthName = viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        setViewDate(newDate);
    };

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
                        <p className="text-[8px] text-white/20 uppercase font-black mt-1 tracking-widest">Entrenamientos registrados</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all outline-none border border-white/5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <button
                            onClick={() => changeMonth(1)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all outline-none border border-white/5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
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
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isSelected = date.toDateString() === selectedDate.toDateString();

                        const hasVisited = member.attendance?.some((v: any) =>
                            new Date(v.checked_in_at).toLocaleDateString() === date.toLocaleDateString()
                        );

                        const routine = getRoutineForDay(date);

                        return (
                            <div
                                key={i}
                                className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${!currentMonth ? 'opacity-20' : ''}`}
                                onClick={() => handleDayClick(date)}
                            >
                                <div
                                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center relative transition-all duration-500 
                                        ${hasVisited ? 'shadow-[0_0_15px]' : 'bg-white/[0.03]'} 
                                        ${routine ? 'border border-white/10' : ''}
                                        ${isSelected ? 'ring-2 ring-white/20 ring-offset-2 ring-offset-[#0A0A0A]' : ''}
                                    `}
                                    style={hasVisited ? { background: primaryColor, boxShadow: `0 0 15px ${primaryColor}60` } : {}}
                                >
                                    {routine ? (
                                        <div className="scale-75 sm:scale-90">
                                            <RoutineIconRenderer
                                                type={routine.routine_type}
                                                className="w-5 h-5"
                                                color={hasVisited ? 'white' : 'rgba(255,255,255,0.6)'}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className={`w-1.5 h-1.5 rounded-full ${hasVisited ? 'bg-white shadow-[0_0_5px_white]' : 'bg-white/10'}`}
                                        />
                                    )}

                                    {isToday && (
                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#0A0A0A]" title="Hoy" />
                                    )}
                                </div>
                                <span className={`text-[8px] mt-2 font-black tracking-tighter transition-colors ${isSelected ? 'text-white' :
                                    currentMonth ? 'text-white/40' : 'text-white/10'
                                    }`}>
                                    {date.getDate()}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day Summary Card */}
            {getRoutineForDay(selectedDate) && (
                <div className="glass-card border-l-4 p-5 animate-in slide-in-from-right duration-500" style={{ borderLeftColor: primaryColor }}>
                    {(() => {
                        const r = getRoutineForDay(selectedDate);
                        const type = ROUTINE_TYPES.find(t => t.id === r.routine_type);
                        return (
                            <div className="flex justify-between items-start">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                            <RoutineIconRenderer type={r.routine_type} className="w-6 h-6" color={primaryColor} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white uppercase tracking-tight leading-none">{type?.name}</h4>
                                            <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest mt-1">
                                                {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {r.sets && r.reps && (
                                            <div className="text-[10px] text-white/80 font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                                {r.sets} sets x {r.reps} reps
                                            </div>
                                        )}
                                        {r.weight && (
                                            <div className="text-[10px] text-white/80 font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                                {r.weight} kg
                                            </div>
                                        )}
                                        {r.duration_minutes && (
                                            <div className="text-[10px] text-white/80 font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                                {r.duration_minutes} min
                                            </div>
                                        )}
                                    </div>
                                    {r.notes && (
                                        <div className="relative">
                                            <div className="absolute left-0 top-0 w-0.5 h-full bg-white/10 rounded-full" />
                                            <p className="text-[11px] text-white/50 italic font-medium leading-relaxed pl-3">"{r.notes}"</p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                </button>
                            </div>
                        );
                    })()}
                </div>
            )}

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

            <RoutineModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onSaveRoutine}
                selectedDate={selectedDate}
                existingRoutine={getRoutineForDay(selectedDate)}
                primaryColor={primaryColor}
            />
        </div>
    );
};
