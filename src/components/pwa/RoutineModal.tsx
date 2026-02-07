'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Hash, Weight as WeightIcon, Activity } from 'lucide-react';
import { RoutineIconRenderer } from './RoutineIcons';

interface RoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (routine: any) => Promise<any>;
    selectedDate: Date;
    existingRoutine?: any;
    primaryColor: string;
}

export const ROUTINE_TYPES = [
    { id: 'pierna', name: 'Pierna' },
    { id: 'pecho', name: 'Pecho' },
    { id: 'espalda', name: 'Espalda' },
    { id: 'hombro', name: 'Hombro' },
    { id: 'brazo', name: 'Brazo' },
    { id: 'abdomen', name: 'Abdomen' },
    { id: 'cardio', name: 'Cardio' },
    { id: 'descanso', name: 'Descanso' },
];

export const RoutineModal: React.FC<RoutineModalProps> = ({
    isOpen,
    onClose,
    onSave,
    selectedDate,
    existingRoutine,
    primaryColor
}) => {
    const [routineType, setRoutineType] = useState('');
    const [sets, setSets] = useState<number | ''>('');
    const [repsStr, setRepsStr] = useState('');
    const [weight, setWeight] = useState<number | ''>('');
    const [duration, setDuration] = useState<number | ''>('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (existingRoutine) {
            setRoutineType(existingRoutine.routine_type || '');
            setSets(existingRoutine.sets ? parseInt(existingRoutine.sets.toString()) : '');
            setRepsStr(existingRoutine.reps?.toString() || '');
            setWeight(existingRoutine.weight ? parseFloat(existingRoutine.weight.toString()) : '');
            setDuration(existingRoutine.duration_minutes ? parseInt(existingRoutine.duration_minutes.toString()) : '');
            setNotes(existingRoutine.notes || '');
        } else {
            setRoutineType('');
            setSets('');
            setRepsStr('');
            setWeight('');
            setDuration('');
            setNotes('');
        }
    }, [existingRoutine, selectedDate]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSaveInner = async () => {
        if (!routineType) return;
        setSubmitting(true);
        const success = await onSave({
            routine_type: routineType,
            sets,
            reps: repsStr,
            weight,
            duration,
            notes,
            date: selectedDate.toISOString().split('T')[0]
        });
        setSubmitting(false);
        if (success !== false) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-[#0A0A0A] border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-5 duration-500 shadow-2xl">
                {/* Drag Handle for mobile */}
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-2 sm:hidden" onClick={onClose} />

                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Registro de Rutina</h2>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
                            {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all outline-none border border-white/5"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">¿Qué entrenaste hoy?</label>
                    <div className="grid grid-cols-4 gap-3">
                        {ROUTINE_TYPES.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setRoutineType(type.id)}
                                className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl transition-all duration-300 border ${routineType === type.id
                                    ? 'border-white/20 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                    : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                                    }`}
                            >
                                <div className={`transition-transform duration-500 ${routineType === type.id ? 'scale-110' : 'opacity-60 grayscale'}`}>
                                    <RoutineIconRenderer
                                        type={type.id}
                                        className="w-10 h-10"
                                        color={routineType === type.id ? primaryColor : 'white'}
                                    />
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-tighter mt-2 ${routineType === type.id ? 'text-white' : 'text-white/20'}`}>
                                    {type.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">
                            <Hash className="w-3 h-3" /> Series x Reps
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={sets}
                                onChange={(e) => setSets(parseInt(e.target.value) || '')}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-white font-black text-lg focus:border-white/20 focus:bg-white/10 transition-all outline-none"
                            />
                            <input
                                type="text"
                                value={repsStr}
                                placeholder="R"
                                onChange={(e) => setRepsStr(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-white font-black text-lg focus:border-white/20 focus:bg-white/10 transition-all outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">
                            <WeightIcon className="w-3 h-3" /> Peso (kg)
                        </label>
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(parseFloat(e.target.value) || '')}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-white font-black text-lg focus:border-white/20 focus:bg-white/10 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">
                        <Clock className="w-3 h-3" /> Duración (min)
                    </label>
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || '')}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-white font-black text-lg focus:border-white/20 focus:bg-white/10 transition-all outline-none"
                        placeholder="45 min"
                    />
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">
                        <Activity className="w-3 h-3" /> Notas o Ejercicio Clave
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ej: sentadillas búlgaras..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-medium text-sm focus:border-white/20 focus:bg-white/10 transition-all outline-none resize-none h-24"
                    />
                </div>

                <button
                    onClick={handleSaveInner}
                    disabled={submitting || !routineType}
                    className="w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                    style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`,
                        boxShadow: `0 10px 30px ${primaryColor}40`
                    }}
                >
                    {submitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            <span>Guardar Rutina</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
