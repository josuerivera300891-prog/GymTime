import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'GymTime - Gestiona tu gimnasio con excelencia',
    description: 'La plataforma premium para el control de socios, asistencias y ventas en tu gimnasio. Carnet digital QR, gestión de pagos y más.',
    openGraph: {
        title: 'GymTime - Gestión Premium de Gimnasios',
        description: 'Eleva la experiencia de tus socios con tecnología de vanguardia.',
        images: ['/landing/pwa_home_birthday.png'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'GymTime',
        description: 'Tecnología para gimnasios modernos.',
        images: ['/landing/pwa_home_birthday.png'],
    },
};

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
