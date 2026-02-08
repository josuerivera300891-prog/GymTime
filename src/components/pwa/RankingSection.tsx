'use client';

import React from 'react';
import { Trophy, Medal, Crown, TrendingUp, User } from 'lucide-react';

interface RankingMember {
    id: string;
    name: string;
    image_url: string;
    count: number;
}

interface RankingSectionProps {
    top10: RankingMember[];
    myPosition: {
        rank: number;
        count: number;
        total: number;
    } | null;
    primaryColor: string;
    monthName: string;
}

export const RankingSection: React.FC<RankingSectionProps> = ({
    top10,
    myPosition,
    primaryColor,
    monthName
}) => {
    const podium = top10.slice(0, 3);
    const rest = top10.slice(3);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500 pb-32">
            <header className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <Trophy className="text-yellow-500" size={24} />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Ranking {monthName}</h2>
                </div>
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">Los más constantes del gimnasio</p>
            </header>

            {/* Podium */}
            <div className="flex items-end justify-center gap-2 px-4 pt-10 pb-4">
                {/* 2nd Place */}
                {podium[1] && (
                    <div className="flex flex-col items-center gap-3 flex-1 max-w-[100px] animate-in slide-in-from-bottom-10 duration-700 delay-100">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-400 p-1 bg-black">
                                {podium[1].image_url ? (
                                    <img src={podium[1].image_url} alt={podium[1].name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-400"><User size={24} /></div>
                                )}
                            </div>
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full ring-4 ring-black">#2</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] font-black text-white truncate w-24">{podium[1].name.split(' ')[0]}</div>
                            <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest">{podium[1].count} visitas</div>
                        </div>
                    </div>
                )}

                {/* 1st Place */}
                {podium[0] && (
                    <div className="flex flex-col items-center gap-4 flex-1 max-w-[120px] -mt-10 animate-in zoom-in duration-1000">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-yellow-500/20 blur-2xl rounded-full animate-pulse" />
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-500 p-1 bg-black">
                                {podium[0].image_url ? (
                                    <img src={podium[0].image_url} alt={podium[0].name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-yellow-500"><User size={40} /></div>
                                )}
                            </div>
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 drop-shadow-lg"><Crown size={32} fill="currentColor" /></div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full ring-4 ring-black shadow-xl shrink-0 whitespace-nowrap">#1 LEYENDA</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-black text-white uppercase tracking-tighter truncate w-28">{podium[0].name}</div>
                            <div className="text-[10px] font-black text-yellow-500/70 uppercase tracking-widest">{podium[0].count} visitas</div>
                        </div>
                    </div>
                )}

                {/* 3rd Place */}
                {podium[2] && (
                    <div className="flex flex-col items-center gap-3 flex-1 max-w-[100px] animate-in slide-in-from-bottom-10 duration-700 delay-200">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-700 p-1 bg-black">
                                {podium[2].image_url ? (
                                    <img src={podium[2].image_url} alt={podium[2].name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-amber-700"><User size={24} /></div>
                                )}
                            </div>
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full ring-4 ring-black">#3</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] font-black text-white truncate w-24">{podium[2].name.split(' ')[0]}</div>
                            <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest">{podium[2].count} visitas</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Rest of the List */}
            <div className="glass-card mx-4 !p-0 overflow-hidden divide-y divide-white/5">
                {rest.map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-all">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-white/20 w-4">#{index + 4}</span>
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5">
                                {member.image_url ? (
                                    <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/20"><User size={18} /></div>
                                )}
                            </div>
                            <div className="font-black text-sm text-white/80">{member.name}</div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-xs font-black text-white italic">{member.count}</div>
                            <div className="text-[8px] text-white/20 uppercase font-black tracking-widest">vistas</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* My Position Floating Card */}
            {myPosition && (
                <div className="fixed bottom-24 left-4 right-4 animate-in slide-in-from-bottom-20 duration-500 z-10">
                    <div
                        className="p-5 rounded-[2rem] bg-black border border-white/10 shadow-2xl flex items-center justify-between overflow-hidden relative"
                        style={{
                            boxShadow: `0 20px 50px -10px ${primaryColor}40`
                        }}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full" style={{ background: primaryColor }} />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black italic border-2"
                                style={{
                                    background: `${primaryColor}20`,
                                    borderColor: `${primaryColor}40`,
                                    color: primaryColor
                                }}>
                                #{myPosition.rank}
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase italic">Tu Posición General</h4>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                                    {myPosition.rank <= 10
                                        ? '¡Estás en el Top 10! 🔥'
                                        : `A ${myPosition.rank - 10} puestos del top`}
                                </p>
                            </div>
                        </div>
                        <div className="text-right relative z-10">
                            <div className="text-xl font-black text-white italic">{myPosition.count}</div>
                            <div className="text-[8px] text-white/20 uppercase font-bold tracking-widest">Asistencias</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
