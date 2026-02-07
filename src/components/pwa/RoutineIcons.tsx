'use client';

import React from 'react';

export const RoutineIcons = {
    pierna: (color: string) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad-pierna" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                <filter id="glow-pierna">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="6" fill="white" fillOpacity="0.03" />
            <g filter="url(#glow-pierna)">
                <path d="M7 4L6 10C6 10 5 14 5 17C5 20 7 22 7 22" stroke="url(#grad-pierna)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M17 4L18 10C18 10 19 14 19 17C19 20 17 22 17 22" stroke="url(#grad-pierna)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M7 10H17M9 14H15" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
            </g>
        </svg>
    ),
    pecho: (color: string) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad-pecho" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="6" fill="white" fillOpacity="0.03" />
            <path d="M12 20C12 20 4 18 4 11C4 7 7 5 12 5M12 20C12 20 20 18 20 11C20 7 17 5 12 5" stroke="url(#grad-pecho)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 5V20" stroke="white" strokeWidth="1" strokeOpacity="0.2" />
            <path d="M7 11C8 13 16 13 17 11" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
        </svg>
    ),
    espalda: (color: string) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad-espalda" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="6" fill="white" fillOpacity="0.03" />
            <path d="M5 7L12 5L19 7L20 13C20 17 17 20 12 21C7 20 4 17 4 13L5 7Z" stroke="url(#grad-espalda)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 11C9 10 15 10 18 11M8 15C10 14 14 14 16 15" stroke="white" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />
        </svg>
    ),
    hombro: (color: string) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="6" fill="white" fillOpacity="0.03" />
            <path d="M12 4C8.5 4 5 6 5 11L6 19M12 4C15.5 4 19 6 19 11L18 19" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M9 11C9.5 13 14.5 13 15 11" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
            <circle cx="12" cy="4" r="2" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1" />
        </svg>
    ),
    brazo: (color: string) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad-brazo" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="6" fill="white" fillOpacity="0.03" />
            <path d="M4 13C4 13 7 9 11 9C15 9 18 12 18 12L21 10" stroke="url(#grad-brazo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 9C11 9 12 13 11 17" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />
            <path d="M7 11C7 11 9 12 11 12" stroke="white" strokeWidth="1" strokeOpacity="0.2" strokeLinecap="round" />
        </svg>
    ),
    abdomen: (color: string) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="6" fill="white" fillOpacity="0.03" />
            <rect x="6" y="5" width="12" height="15" rx="3" stroke={color} strokeWidth="2.5" />
            <path d="M6 10H18M6 15H18M12 5V20" stroke="white" strokeWidth="1" strokeOpacity="0.1" />
            <g fill="white" fillOpacity="0.6">
                <circle cx="10" cy="8" r="1" />
                <circle cx="14" cy="8" r="1" />
                <circle cx="10" cy="12.5" r="1" />
                <circle cx="14" cy="12.5" r="1" />
                <circle cx="10" cy="17" r="1" />
                <circle cx="14" cy="17" r="1" />
            </g>
        </svg>
    ),
    cardio: (color: string) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="6" fill="white" fillOpacity="0.03" />
            <path d="M12 20C12 20 4 15 4 8.5C4 5 7 3 12 6.5C17 3 20 5 20 8.5C20 15 12 20 12 20Z" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 10.5L11.5 13L16 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    descanso: (color: string) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="6" fill="white" fillOpacity="0.03" />
            <path d="M20 12.5C20 17 16.5 20.5 12 20.5C7.5 20.5 4 17 4 12.5C4 8 7.5 4.5 12 4.5C13.5 4.5 15 5 16 5.5" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M12 8L12 13L15 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 6L21 9M21 6L18 9" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
        </svg>
    )
};

export const RoutineIconRenderer: React.FC<{ type: string; color?: string; className?: string }> = ({ type, color, className }) => {
    const iconFn = (RoutineIcons as any)[type];
    if (!iconFn) return null;
    return <div className={className}>{iconFn(color || '#FFFFFF')}</div>;
};
