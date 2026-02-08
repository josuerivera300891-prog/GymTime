'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { uploadMemberPhoto } from '@/app/actions/members';

export type PWATab = 'home' | 'attendance' | 'carnet' | 'store' | 'profile';

export function usePWA() {
    const searchParams = useSearchParams();
    const [token, setToken] = useState<string | null>(null);
    const [member, setMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<PWATab>('home');
    const [products, setProducts] = useState<any[]>([]);
    const [brightnessBoost, setBrightnessBoost] = useState(false);

    // --- NOTIFICATION & INSTALL STATES ---
    const [showNotifModal, setShowNotifModal] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        let t = searchParams.get('token');
        if (!t && typeof window !== 'undefined') {
            const search = window.location.search;
            const match = search.match(/token(?:%3D|=)([^&]*)/i);
            if (match && match[1]) {
                t = match[1];
            }
        }
        setToken(t);
    }, [searchParams]);

    useEffect(() => {
        if (token) {
            fetchMemberData();
        } else {
            setLoading(false);
        }

        const ios = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(ios);

        const isStandalone = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            const dismissed = sessionStorage.getItem('pwa_install_dismissed');
            if (!dismissed && !isStandalone) {
                setShowInstallBanner(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        if (ios && !isStandalone) {
            const dismissed = sessionStorage.getItem('pwa_install_dismissed');
            if (!dismissed) {
                setShowInstallBanner(true);
            }
        }

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, [token]);

    useEffect(() => {
        if (!loading && member && !error) {
            const checkNotifs = async () => {
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
        if (!token) return;
        try {
            const response = await fetch(`/api/member?token=${token}`);
            const data = await response.json();

            if (!response.ok || data.error) {
                setError(data.error || 'Error al cargar perfil');
                setLoading(false);
                return;
            }

            const memberData = data.member;

            if (memberData) {
                const visits = memberData.attendance || [];
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                const visitsThisWeek = visits.filter((v: any) => new Date(v.checked_in_at) >= startOfWeek).length;
                const visitsThisMonth = visits.filter((v: any) => new Date(v.checked_in_at) >= startOfMonth).length;

                setMember({ ...memberData, visitsThisWeek, visitsThisMonth });

                const prodResponse = await fetch(`/api/store?tenant_id=${memberData.tenant_id}`);
                const prodData = await prodResponse.json();
                if (prodData.products) {
                    setProducts(prodData.products);
                }
            }
            setLoading(false);
        } catch (error) {
            setError('Error al cargar perfil');
            setLoading(false);
        }
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || !e.target.files[0] || !member) return { success: false, error: 'No file or member' };

        const file = e.target.files[0];
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('memberId', member.id);
        formData.append('tenantId', member.tenant_id);
        if (token) {
            formData.append('authToken', token);
        }

        try {
            const result = await uploadMemberPhoto(formData);
            if (result.success) {
                setMember({ ...member, image_url: result.url });
                return { success: true, url: result.url };
            } else {
                throw new Error(result.error);
            }
        } catch (e: any) {
            return { success: false, error: e.message };
        } finally {
            setUploading(false);
        }
    }

    async function subscribePush() {
        if (!member) return false;

        // Request permission explicitly if not granted
        if (typeof window !== 'undefined' && 'Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setShowNotifModal(false);
                sessionStorage.setItem('notif_prompt_dismissed', 'true');
                return false;
            }
        }

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
                    platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown'
                })
            });

            setShowNotifModal(false);
            sessionStorage.setItem('notif_prompt_dismissed', 'true');
            return true;
        } catch (error) {
            console.error('Push error:', error);
            // If it fails, we still might want to close the modal or at least stop the spinner
            setShowNotifModal(false);
            sessionStorage.setItem('notif_prompt_dismissed', 'true');
            return false;
        } finally {
            setSubscribing(false);
        }
    }

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowInstallBanner(false);
            }
            setDeferredPrompt(null);
        }
    };

    const dismissInstallBanner = () => {
        setShowInstallBanner(false);
        sessionStorage.setItem('pwa_install_dismissed', 'true');
    };

    const dismissNotifModal = () => {
        setShowNotifModal(false);
        sessionStorage.setItem('notif_prompt_dismissed', 'true');
    };

    return {
        token, member, loading, subscribing, uploading, error, activeTab, setActiveTab,
        products, brightnessBoost, setBrightnessBoost, showNotifModal, setShowNotifModal,
        showInstallBanner, setShowInstallBanner, isIOS, deferredPrompt,
        handleFileChange, subscribePush, handleInstallClick, dismissInstallBanner, dismissNotifModal,
        saveRoutine: async (routineData: any) => {
            if (!member) return;
            try {
                const response = await fetch('/api/member/routine', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...routineData,
                        member_id: member.id,
                        tenant_id: member.tenant_id
                    })
                });

                if (response.ok) {
                    await fetchMemberData(); // Refresh data to show new routine
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Error saving routine:', error);
                return false;
            }
        }
    };
}
