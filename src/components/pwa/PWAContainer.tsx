'use client';

import React from 'react';

interface PWAContainerProps {
    children: React.ReactNode;
    primaryColor: string;
}

export const PWAContainer: React.FC<PWAContainerProps> = ({ children, primaryColor }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white p-4 pb-24 font-sans relative overflow-x-hidden">
            {/* Simplified Background (Performance Optimized) */}
            <div className="fixed inset-0 opacity-5 pointer-events-none">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full"
                    style={{ background: `radial-gradient(circle, ${primaryColor}20 0%, transparent 70%)` }}
                ></div>
            </div>
            {/* Noise Texture Overlay */}
            <div
                className="fixed inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=)' }}
            ></div>

            <style jsx global>{`
                :root {
                    --brand-primary: ${primaryColor};
                }
                .glass-card {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
                    backdrop-filter: blur(8px) saturate(150%);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 24px;
                    padding: 20px;
                    box-shadow: 
                        0 8px 32px rgba(0, 0, 0, 0.25),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1),
                        0 1px 0 rgba(255, 255, 255, 0.05);
                    position: relative;
                }
                .glass-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 24px;
                    padding: 1px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                }
                .stat-card {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
                    backdrop-filter: blur(8px) saturate(150%);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 20px;
                    padding: 16px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 
                        0 4px 24px rgba(0, 0, 0, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.15);
                }
                .stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, ${primaryColor}80, #7c3aed60, transparent);
                }
                .stat-card::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, ${primaryColor}08 0%, transparent 70%);
                    pointer-events: none;
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes shine {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
            `}</style>

            {children}

            {/* Footer */}
            <footer className="text-center text-white/10 text-[10px] py-10 uppercase tracking-[0.4em] font-black">
                Powered by <span className="text-white/30">GymTime</span>
            </footer>
        </div>
    );
};
