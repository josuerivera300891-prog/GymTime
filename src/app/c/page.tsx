'use client';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { uploadMemberPhoto } from '@/app/actions/members';
import { QRCodeSVG } from 'qrcode.react';
import NotificationModal from '@/components/NotificationModal';


export default function ClientPage() {
    const searchParams = useSearchParams();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        let t = searchParams.get('token');

        // Fallback para URLs malformadas o codificadas como ?token%3DAAE8816C
        if (!t && typeof window !== 'undefined') {
            const search = window.location.search;
            const match = search.match(/token(?:%3D|=)([^&]*)/i);
            if (match && match[1]) {
                t = match[1];
            }
        }
        setToken(t);
    }, [searchParams]);
    const [member, setMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'home' | 'attendance' | 'carnet' | 'store' | 'profile'>('home');
    const [products, setProducts] = useState<any[]>([]);
    const [brightnessBoost, setBrightnessBoost] = useState(false);

    // --- NOTIFICATION & INSTALL STATES ---
    const [showNotifModal, setShowNotifModal] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    // --- PROFESIONAL SVG ICONS ---
    const IconHome = ({ active, color }: { active?: boolean; color: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={active ? color : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    );

    const IconCalendar = ({ active, color }: { active?: boolean; color: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={active ? color : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );

    const IconQr = ({ active, color }: { active?: boolean; color: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={active ? color : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all">
            <rect width="5" height="5" x="3" y="3" rx="1" />
            <rect width="5" height="5" x="16" y="3" rx="1" />
            <rect width="5" height="5" x="3" y="16" rx="1" />
            <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
            <path d="M21 21v.01" />
            <path d="M12 7v3a2 2 0 0 1-2 2H7" />
            <path d="M3 12h.01" />
            <path d="M12 3h.01" />
            <path d="M12 16v.01" />
            <path d="M16 12h1" />
            <path d="M21 12v.01" />
            <path d="M12 21v-1" />
        </svg>
    );

    const IconPayments = ({ color }: { color: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
    );

    const IconInvoices = ({ color }: { color: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    );

    const IconStore = ({ active, color }: { active?: boolean; color: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={active ? color : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all">
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
            <path d="M12 3v6" />
        </svg>
    );

    const IconProfile = ({ active, color }: { active?: boolean; color: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={active ? color : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );

    const IconSettings = ({ color }: { color: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('memberId', member.id);
        formData.append('tenantId', member.tenant_id);

        try {
            const result = await uploadMemberPhoto(formData);
            if (result.success) {
                setMember({ ...member, image_url: result.url });
                alert('¡Foto actualizada!');
            } else {
                alert('Error: ' + result.error);
            }
        } catch (e) {
            console.error(e);
            alert('Error al subir foto');
        } finally {
            setUploading(false);
        }
    }

    useEffect(() => {
        if (token) {
            fetchMemberData();
        } else {
            setLoading(false);
        }

        // Detect iOS
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(ios);

        // Check if already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        // Register beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Only show if not already dismissed this session
            const dismissed = sessionStorage.getItem('pwa_install_dismissed');
            if (!dismissed && !isStandalone) {
                setShowInstallBanner(true);
            }
        });

        // For iOS, check standalone and show banner if not installed
        if (ios && !isStandalone) {
            const dismissed = sessionStorage.getItem('pwa_install_dismissed');
            if (!dismissed) {
                setShowInstallBanner(true);
            }
        }
    }, [token]);

    // Proactive Notification Prompt
    useEffect(() => {
        if (!loading && member && !error) {
            const checkNotifs = async () => {
                // Wait for a few seconds for better UX
                await new Promise(r => setTimeout(r, 3000));

                if (typeof window !== 'undefined' && 'Notification' in window) {
                    if (Notification.permission === 'default') {
                        const dismissed = sessionStorage.getItem('notif_prompt_dismissed');
                        if (!dismissed) {
                            setShowNotifModal(true);
                        }
                    }
                }
            };
            checkNotifs();
        }
    }, [loading, member, error]);

    async function fetchMemberData() {
        try {
            const response = await fetch(`/api/member?token=${token}`);
            const data = await response.json();

            if (!response.ok || data.error) {
                console.error('PWA Fetch Error:', data.error);
                setError(data.error || 'Error al cargar perfil');
                setLoading(false);
                return;
            }

            const member = data.member;

            if (member) {
                // Calculate Stats
                const visits = member.attendance || [];
                const now = new Date();
                now.setHours(0, 0, 0, 0);

                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());

                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                const visitsThisWeek = visits.filter((v: any) => new Date(v.checked_in_at) >= startOfWeek).length;
                const visitsThisMonth = visits.filter((v: any) => new Date(v.checked_in_at) >= startOfMonth).length;

                setMember({ ...member, visitsThisWeek, visitsThisMonth });

                // Fetch Products
                const prodResponse = await fetch(`/api/store?tenant_id=${member.tenant_id}`);
                const prodData = await prodResponse.json();
                if (prodData.products) {
                    setProducts(prodData.products);
                }
            }
            setLoading(false);
        } catch (error) {
            console.error('PWA Fetch Error:', error);
            setError('Error al cargar perfil');
            setLoading(false);
        }
    }

    async function subscribePush() {
        if (!member) return;

        setSubscribing(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            });

            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenant_id: member.tenant_id,
                    member_id: member.id,
                    push_endpoint: subscription.endpoint,
                    push_p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh')!)))),
                    push_auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth')!)))),
                    platform: navigator.platform
                })
            });

            setShowNotifModal(false);
            sessionStorage.setItem('notif_prompt_dismissed', 'true');
        } catch (error) {
            console.error('Push error:', error);
        } finally {
            setSubscribing(false);
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-[#E6007E] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="text-white/40 text-sm uppercase tracking-widest font-bold">Cargando Perfil...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
            <div className="text-center space-y-4 max-w-sm">
                <div className="text-6xl">❌</div>
                <div className="text-red-400 font-bold text-xl">{error}</div>
                <p className="text-white/40 text-sm">Asegúrate de usar el enlace correcto.</p>
            </div>
        </div>
    );

    if (!token || !member) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
                <div className="text-center space-y-6 max-w-sm">
                    <div className="text-6xl">🏋️‍♂️</div>
                    <h1 className="text-2xl font-bold text-white">Bienvenido a GymTime</h1>
                    <p className="text-white/50">Por favor usa el enlace que recibiste por WhatsApp para acceder a tu perfil.</p>
                </div>
            </div>
        );
    }

    const nextDueDate = new Date(member.memberships[0].next_due_date);
    const today = new Date();
    const diffTime = nextDueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isExpired = member.status === 'EXPIRED' || diffDays < 0;

    const primaryColor = member.tenants.primary_color || '#E6007E';

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white p-4 pb-24 font-sans relative overflow-x-hidden">
            {/* Premium Animated Background */}
            <div className="fixed inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[200px] animate-pulse"
                    style={{ background: `radial-gradient(circle, ${primaryColor}30 0%, #7c3aed20 40%, transparent 70%)` }}></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[180px]"
                    style={{ background: `radial-gradient(circle, #3b82f620 0%, transparent 70%)` }}></div>
            </div>
            {/* Noise Texture Overlay */}
            <div className="fixed inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=)' }}></div>

            <style jsx global>{`
                :root {
                    --brand-primary: ${primaryColor};
                }
                .glass-card {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
                    backdrop-filter: blur(20px) saturate(180%);
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
                    backdrop-filter: blur(16px) saturate(180%);
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
                .bottom-nav {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    background: linear-gradient(to top, rgba(10, 10, 10, 0.98), rgba(15, 15, 15, 0.95));
                    backdrop-filter: blur(24px) saturate(180%);
                    border-top: 1px solid rgba(255, 255, 255, 0.12);
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    padding: 12px 0 calc(env(safe-area-inset-bottom) + 8px) 0;
                    z-index: 40;
                    box-shadow: 
                        0 -8px 32px rgba(0, 0, 0, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.08);
                }
                .bottom-nav::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, ${primaryColor}40, #7c3aed30, transparent);
                }
                .nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 8px 4px;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 9px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    gap: 4px;
                    position: relative;
                }
                .nav-item::before {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%) scaleX(0);
                    width: 40%;
                    height: 2px;
                    background: linear-gradient(90deg, ${primaryColor}, #7c3aed);
                    border-radius: 2px;
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .nav-item.active::before {
                    transform: translateX(-50%) scaleX(1);
                }
                .nav-item.active {
                    color: white;
                }
                .nav-item.active svg {
                    transform: scale(1.15);
                    filter: drop-shadow(0 0 8px ${primaryColor}60);
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

            {/* Blocking Overlay for Expired Members */}
            {isExpired && (
                <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-red-500/30 animate-pulse">
                        <span className="text-5xl">⚠️</span>
                    </div>
                    <h1 className="text-3xl font-black text-white mb-4 leading-tight uppercase tracking-tight">
                        TU MEMBRESÍA ESTÁ VENCIDA
                    </h1>
                    <p className="text-white/60 mb-10 text-lg max-w-sm">
                        Realiza el pago en caja para seguir asistiendo al gym y activar tu membresía.
                    </p>
                    <div className="w-full max-w-sm space-y-4">
                        <div className="glass-card">
                            <div className="text-xs text-white/30 uppercase font-black mb-1">
                                Tu {member.memberships[0]?.plan_name || 'Membresía'} Venció el
                            </div>
                            <div className="text-xl font-bold text-red-400">{nextDueDate.toLocaleDateString()}</div>
                        </div>
                        <p className="text-[10px] text-white/20 italic uppercase tracking-widest">Powered by GymTime</p>
                    </div>
                </div>
            )}

            {/* Gym Branding Header */}
            <div className="flex flex-col items-center mb-8 animate-in fade-in zoom-in duration-700">
                {member.tenants.logo_url ? (
                    <img
                        src={member.tenants.logo_url}
                        alt={member.tenants.name}
                        className="h-16 object-contain mb-4 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    />
                ) : (
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-4 text-4xl border border-white/10">
                        🏋️‍♂️
                    </div>
                )}
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1">
                    {member.tenants.name}
                </h2>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold">
                    {member.tenants.country}
                </p>
            </div>

            {/* Member Profile Card */}
            <div className="glass-card mb-8">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        {member.image_url ? (
                            <img
                                src={member.image_url}
                                alt={member.name}
                                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center border-2 border-white/10 text-3xl">
                                👤
                            </div>
                        )}
                        <label className="absolute -bottom-2 -right-2 p-2 rounded-xl cursor-pointer shadow-lg hover:scale-110 transition-transform"
                            style={{ background: primaryColor }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                        </label>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Miembro</div>
                        <h1 className="text-xl font-black text-white tracking-tight leading-tight truncate">{member.name}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${member.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {member.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                            </span>
                            <span className="text-[10px] text-white/30 font-bold">Vence {new Date(member.memberships[0].next_due_date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bottom-nav">
                <button
                    onClick={() => setActiveTab('home')}
                    className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                >
                    <div className="mb-1">
                        <IconHome active={activeTab === 'home'} color={primaryColor} />
                    </div>
                    Inicio
                </button>
                <button
                    onClick={() => setActiveTab('attendance')}
                    className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
                >
                    <div className="mb-1">
                        <IconCalendar active={activeTab === 'attendance'} color={primaryColor} />
                    </div>
                    Asistencias
                </button>
                <button
                    onClick={() => setActiveTab('carnet')}
                    className={`nav-item ${activeTab === 'carnet' ? 'active' : ''}`}
                >
                    <div className="mb-1">
                        <IconQr active={activeTab === 'carnet'} color={primaryColor} />
                    </div>
                    Carnet
                </button>
                <button
                    onClick={() => setActiveTab('store')}
                    className={`nav-item ${activeTab === 'store' ? 'active' : ''}`}
                >
                    <div className="mb-1">
                        <IconStore active={activeTab === 'store'} color={primaryColor} />
                    </div>
                    Tienda
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                >
                    <div className="mb-1">
                        <IconProfile active={activeTab === 'profile'} color={primaryColor} />
                    </div>
                    Perfil
                </button>
            </div>

            {/* Tab Content */}
            <div className="pb-20">
                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {/* Quick Stats */}
                        <div className="glass-card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${primaryColor}20` }}>
                                        <IconCalendar color={primaryColor} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] text-white/30 uppercase font-black tracking-wider">Esta Semana</div>
                                        <div className="text-2xl font-black text-white">{member.visitsThisWeek}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-[10px] text-white/30 uppercase font-black tracking-wider">Este Mes</div>
                                        <div className="text-2xl font-black text-white">{member.visitsThisMonth}</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${primaryColor}20` }}>
                                        <IconCalendar color={primaryColor} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button - Show QR */}
                        <button
                            onClick={() => setActiveTab('carnet')}
                            className="relative w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-4 group overflow-hidden"
                            style={{
                                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 50%, #7c3aed 100%)`,
                                boxShadow: `0 10px 40px ${primaryColor}40, 0 0 20px ${primaryColor}20, inset 0 1px 0 rgba(255,255,255,0.2)`
                            }}
                        >
                            {/* Shine Effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{
                                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                                    transform: 'translateX(-100%)',
                                    animation: 'shine 2s infinite'
                                }}></div>
                            <IconQr color="white" />
                            <span className="relative z-10">Mostrar mi QR</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-300">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>

                        {/* Expiration Card */}
                        {member.memberships && member.memberships.length > 0 && (
                            <div className="glass-card border-2" style={{ borderColor: `${primaryColor}30` }}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${primaryColor}20` }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-[10px] text-white/30 uppercase font-black tracking-wider mb-1">Próximo Vencimiento</div>
                                            <div className="text-base font-black text-white">
                                                {new Date(member.memberships[0].next_due_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 rounded-full" style={{ background: member.status === 'ACTIVE' ? '#10b98120' : '#ef444420', color: member.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}>
                                        <span className="text-xs font-black uppercase tracking-wider">
                                            {member.status === 'ACTIVE' ? 'Activa' : 'Vencida'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ATTENDANCE TAB */}
                {activeTab === 'attendance' && (
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

                        <div className="glass-card">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-black uppercase text-white/40 tracking-[0.2em]">Calendario de Entrenamiento</h3>
                            </div>
                            <div className="grid grid-cols-7 gap-3">
                                {Array.from({ length: 28 }).map((_, i) => {
                                    const day = new Date();
                                    day.setDate(day.getDate() - (27 - i));
                                    const hasVisited = member.attendance?.some((v: any) =>
                                        new Date(v.checked_in_at).toLocaleDateString() === day.toLocaleDateString()
                                    );
                                    return (
                                        <div key={i} className="flex flex-col items-center">
                                            <div
                                                className={`w-4 h-4 rounded-full transition-all duration-500 ${hasVisited ? 'scale-110 shadow-[0_0_15px]' : 'bg-white/5'}`}
                                                style={hasVisited ? { background: primaryColor, boxShadow: `0 0 15px ${primaryColor}80` } : {}}
                                            ></div>
                                            <span className="text-[7px] text-white/20 mt-2 font-black italic">{day.getDate()}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/20 ml-1">Historial Reciente</h3>
                            {member.attendance?.slice(0, 10).map((visit: any) => (
                                <div key={visit.id} className="glass-card flex items-center justify-between group hover:bg-white/5 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-white uppercase tracking-tight">
                                                {new Date(visit.checked_in_at).toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' })}
                                            </div>
                                            <div className="text-[10px] text-white/30 font-black">
                                                Check-in: {new Date(visit.checked_in_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-green-500/60 uppercase tracking-widest mr-2">Entrada OK</div>
                                </div>
                            ))}
                            {!member.attendance?.length && (
                                <div className="text-center py-10 glass-card text-white/20 text-xs italic">Aún no hay registros de asistencia</div>
                            )}
                        </div>
                    </div>
                )}

                {/* CARNET TAB */}
                {activeTab === 'carnet' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className={`glass-card text-center !p-8 transition-all duration-500 ${brightnessBoost ? 'brightness-150' : ''}`}>
                            <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/40 mb-2">
                                CARNET DIGITAL
                            </h2>
                            <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest mb-10">
                                Muestra este código en recepción
                            </p>

                            {/* QR Code with concentrated glow */}
                            <div className="relative inline-block mb-10">
                                <div
                                    className="absolute inset-0 blur-[60px] opacity-40 rounded-full"
                                    style={{ background: primaryColor }}
                                ></div>
                                <div className="relative bg-white p-6 rounded-[40px] shadow-2xl">
                                    <QRCodeSVG
                                        value={token || ''}
                                        size={240}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-3">
                                <span className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-lg ${member.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                                    member.status === 'EXPIRING' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :
                                        'bg-red-500/20 text-red-400 border border-red-500/20'
                                    }`}>
                                    {member.status === 'ACTIVE' ? 'ACTIVA' : member.status === 'EXPIRING' ? 'POR VENCER' : 'VENCIDA'}
                                </span>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">
                                    Expira: {new Date(member.memberships[0].next_due_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                                {/* Member Code - More Visible */}
                                <div className="mt-6 px-8 py-4 rounded-3xl border-2" style={{ background: `${primaryColor}10`, borderColor: `${primaryColor}50` }}>
                                    <div className="flex items-center justify-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <line x1="19" y1="8" x2="19" y2="14"></line>
                                            <line x1="22" y1="11" x2="16" y2="11"></line>
                                        </svg>
                                        <div className="text-center">
                                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Código de Cliente</p>
                                            <p className="text-white text-2xl font-black tracking-wider" style={{ color: primaryColor }}>
                                                {member.member_number || member.id.slice(0, 8).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={subscribePush}
                                disabled={subscribing}
                                className="glass-card flex items-center justify-center gap-3 !p-5 hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest text-white group"
                            >
                                {subscribing ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="group-hover:animate-bounce" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                                )}
                                Avisos
                            </button>

                            <button
                                onClick={() => setBrightnessBoost(!brightnessBoost)}
                                className={`glass-card flex items-center justify-center gap-3 !p-5 transition-all text-xs font-black uppercase tracking-widest text-white ${brightnessBoost ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'hover:bg-white/5'}`}
                            >
                                <svg className={brightnessBoost ? 'animate-spin-slow' : ''} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M22 12h2" /><path d="m4.93 19.07 1.41-1.41" /><path d="m17.66 6.34 1.41-1.41" /></svg>
                                Brillo
                            </button>
                        </div>

                        <div className="glass-card flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                                <IconProfile color="currentColor" />
                            </div>
                            <div>
                                <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Plan Actual</div>
                                <div className="text-sm font-black text-[#E6007E] uppercase tracking-widest">
                                    {member.memberships[0]?.plan_name || 'Sin Plan Activo'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STORE TAB */}
                {activeTab === 'store' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="flex justify-between items-center mb-2 px-2">
                            <h3 className="text-xl font-black uppercase tracking-tight">Catálogo</h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                {products.length} Productos
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {products.map((product) => (
                                <div key={product.id} className="glass-card !p-0 overflow-hidden flex flex-col group active:scale-[0.98] transition-all">
                                    <div className="relative aspect-square">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-3xl opacity-20">
                                                📦
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                                            <span className="text-[9px] font-black text-white/70 tracking-widest uppercase">
                                                {product.stock} disp.
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col">
                                        <h4 className="text-sm font-black uppercase tracking-tight line-clamp-1 mb-1">{product.name}</h4>
                                        <p className="text-[9px] text-white/40 italic line-clamp-1 mb-3">{product.description || 'Calidad premium.'}</p>

                                        <div className="mt-auto flex items-center justify-between">
                                            <div className="text-base font-black" style={{ color: primaryColor }}>
                                                {member.tenants.currency_symbol}{Number(product.price).toLocaleString()}
                                            </div>
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-brand-500/20 group-hover:border-brand-500/50 transition-all">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {products.length === 0 && (
                            <div className="py-20 text-center glass-card">
                                <div className="text-5xl mb-4 opacity-20">🏪</div>
                                <p className="text-white/30 text-xs font-black uppercase tracking-[0.2em]">Tienda cerrada temporalmente</p>
                                <p className="text-white/20 text-[10px] mt-1 italic tracking-widest">Pronto tendremos novedades para ti.</p>
                            </div>
                        )}

                        {/* Store Info Footer */}
                        <div className="text-center py-4">
                            <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.2em] max-w-[200px] mx-auto italic">
                                * Compra directamente en recepción mostrando tu código QR
                            </p>
                        </div>
                    </div>
                )}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Mi Perfil</h2>
                            <p className="text-xs text-white/40 uppercase tracking-widest">Configuración personal</p>
                        </div>

                        {/* Profile Photo */}
                        <div className="flex flex-col items-center gap-4 mb-8">
                            <div className="relative">
                                {member.image_url ? (
                                    <img
                                        src={member.image_url}
                                        alt={member.name}
                                        className="w-32 h-32 rounded-3xl object-cover border-4 border-white/10"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-3xl bg-white/5 flex items-center justify-center border-4 border-white/10 text-6xl">
                                        👤
                                    </div>
                                )}
                                <label className="absolute -bottom-3 -right-3 p-3 rounded-2xl cursor-pointer shadow-2xl hover:scale-110 transition-transform"
                                    style={{ background: primaryColor }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                                </label>
                            </div>
                            {uploading && (
                                <div className="flex items-center gap-2 text-xs text-white/60">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Subiendo foto...
                                </div>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="space-y-3">
                            <div className="glass-card">
                                <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Nombre Completo</div>
                                <div className="text-lg font-black text-white">{member.name}</div>
                            </div>
                            <div className="glass-card">
                                <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Email</div>
                                <div className="text-sm font-bold text-white/60">{member.email || 'No registrado'}</div>
                            </div>
                            <div className="glass-card">
                                <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Teléfono</div>
                                <div className="text-sm font-bold text-white/60">{member.phone || 'No registrado'}</div>
                            </div>
                            <div className="glass-card">
                                <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Miembro Desde</div>
                                <div className="text-sm font-bold text-white/60">{new Date(member.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                            </div>
                            <div className="glass-card">
                                <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Estado</div>
                                <span className={`inline-block px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${member.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {member.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>

                        <div className="text-center pt-4">
                            <p className="text-xs text-white/20 uppercase tracking-widest">Para actualizar tus datos, contacta a recepción</p>
                        </div>
                    </div>
                )}


            </div>

            {/* Footer */}
            <footer className="text-center text-white/10 text-[10px] py-10 uppercase tracking-[0.4em] font-black">
                Powered by <span className="text-white/30">GymTime</span>
            </footer>

            {/* Notification Modal */}
            <NotificationModal
                isOpen={showNotifModal}
                onClose={() => {
                    setShowNotifModal(false);
                    sessionStorage.setItem('notif_prompt_dismissed', 'true');
                }}
                onAccept={subscribePush}
                subscribing={subscribing}
                primaryColor={primaryColor}
            />

            {/* PWA Install Banner (Snackbar) */}
            {showInstallBanner && (
                <div className="fixed bottom-24 left-4 right-4 z-[60] animate-in slide-in-from-bottom-10 fade-in duration-700">
                    <div className="glass-card !p-5 flex items-center justify-between gap-4 border-white/20 shadow-2xl overflow-hidden relative">
                        {/* Glow effect */}
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: primaryColor }}></div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">
                                📱
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black uppercase tracking-tight text-white leading-none mb-1">Guarda esta App</h4>
                                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-tight">
                                    Añade {isIOS ? 'a Inicio desde el menú compartir' : 'a tu inicio para acceso rápido'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {!isIOS && deferredPrompt && (
                                <button
                                    onClick={async () => {
                                        if (deferredPrompt) {
                                            deferredPrompt.prompt();
                                            const { outcome } = await deferredPrompt.userChoice;
                                            if (outcome === 'accepted') {
                                                setShowInstallBanner(false);
                                            }
                                            setDeferredPrompt(null);
                                        }
                                    }}
                                    className="px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] text-white transition-all shadow-lg active:scale-95 whitespace-nowrap"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Instalar
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setShowInstallBanner(false);
                                    sessionStorage.setItem('pwa_install_dismissed', 'true');
                                }}
                                className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
