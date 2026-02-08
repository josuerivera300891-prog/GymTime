'use client';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

import React from 'react';
import { usePWA } from '@/hooks/usePWA';
import NotificationModal from '@/components/NotificationModal';
import { PWAContainer } from '@/components/pwa/PWAContainer';
import { PWAStatus } from '@/components/pwa/PWAStatus';
import { PWANav } from '@/components/pwa/PWANav';
import { PWAHeader, PWAMemberSummary } from '@/components/pwa/PWAHeader';
import { HomeSection } from '@/components/pwa/HomeSection';
import { AttendanceSection } from '@/components/pwa/AttendanceSection';
import { CarnetSection } from '@/components/pwa/CarnetSection';
import { StoreSection } from '@/components/pwa/StoreSection';
import { ProfileSection } from '@/components/pwa/ProfileSection';
import { ExpiredOverlay } from '@/components/pwa/ExpiredOverlay';
import { InstallBanner } from '@/components/pwa/InstallBanner';
import { BirthdayBanner } from '@/components/pwa/BirthdayBanner';
import { ExpiringBanner } from '@/components/pwa/ExpiringBanner';

export default function ClientPage() {
    const {
        token, member, loading, subscribing, uploading, error, activeTab, setActiveTab,
        products, brightnessBoost, setBrightnessBoost, showNotifModal, setShowNotifModal,
        showInstallBanner, isIOS, deferredPrompt,
        leaderboard, loadingLeaderboard, fetchLeaderboard,
        handleFileChange, subscribePush, handleInstallClick, dismissInstallBanner, dismissNotifModal, saveRoutine
    } = usePWA();

    if (loading) return <PWAStatus.Loading />;
    if (error) return <PWAStatus.Error message={error} />;
    if (!token || !member) return <PWAStatus.NoToken />;

    // Safe access to memberships - handle case where member has no active membership
    const activeMembership = member.memberships?.[0];
    const nextDueDate = activeMembership?.next_due_date
        ? new Date(activeMembership.next_due_date + 'T12:00:00') // Add time to avoid timezone issues
        : new Date();
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Normalize to midday
    const diffTime = nextDueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isExpired = member.status === 'EXPIRED' || diffDays < 0 || !activeMembership;

    const primaryColor = member.tenants.primary_color || '#E6007E';

    return (
        <PWAContainer primaryColor={primaryColor}>
            {/* Blocking Overlay for Expired Members */}
            {isExpired && <ExpiredOverlay member={member} />}

            {/* Gym Branding Header */}
            <PWAHeader tenant={member.tenants} />

            {/* Birthday Banner (shows only on member's birthday) */}
            <BirthdayBanner
                memberName={member.name}
                memberBirthdate={member.birthdate}
                tenantName={member.tenants.name}
                primaryColor={primaryColor}
            />

            {/* Expiring Soon Banner (shows 1-5 days before expiration) */}
            {!isExpired && activeMembership && (
                <ExpiringBanner
                    daysUntilExpiration={diffDays}
                    planName={activeMembership.plan_name || 'Membresía'}
                    expirationDate={activeMembership.next_due_date}
                    primaryColor={primaryColor}
                />
            )}

            {/* Member Profile Card (Resumen) */}
            <PWAMemberSummary
                member={member}
                primaryColor={primaryColor}
                onFileChange={handleFileChange}
                uploading={uploading}
            />

            {/* Tab Navigation */}
            <PWANav
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                primaryColor={primaryColor}
            />

            {/* Tab Content */}
            <div className="pb-20">
                {activeTab === 'home' && (
                    <HomeSection
                        member={member}
                        primaryColor={primaryColor}
                        onShowQR={() => setActiveTab('carnet')}
                    />
                )}

                {activeTab === 'attendance' && member && (
                    <AttendanceSection
                        member={member}
                        primaryColor={primaryColor}
                        leaderboard={leaderboard}
                        loadingLeaderboard={loadingLeaderboard}
                    />
                )}

                {activeTab === 'carnet' && (
                    <CarnetSection
                        member={member}
                        token={token}
                        primaryColor={primaryColor}
                        brightnessBoost={brightnessBoost}
                        setBrightnessBoost={setBrightnessBoost}
                        onSubscribe={subscribePush}
                        subscribing={subscribing}
                    />
                )}

                {activeTab === 'store' && (
                    <StoreSection
                        products={products}
                        member={member}
                        primaryColor={primaryColor}
                    />
                )}

                {activeTab === 'profile' && (
                    <ProfileSection
                        member={member}
                        primaryColor={primaryColor}
                        onFileChange={handleFileChange}
                        uploading={uploading}
                    />
                )}
            </div>

            {/* Global Modals & Banners */}
            <NotificationModal
                isOpen={showNotifModal}
                onClose={dismissNotifModal}
                onAccept={subscribePush}
                subscribing={subscribing}
                primaryColor={primaryColor}
            />

            {showInstallBanner && (
                <InstallBanner
                    isIOS={isIOS}
                    primaryColor={primaryColor}
                    onInstall={handleInstallClick}
                    onDismiss={dismissInstallBanner}
                    hasDeferredPrompt={!!deferredPrompt}
                />
            )}
        </PWAContainer>
    );
}
