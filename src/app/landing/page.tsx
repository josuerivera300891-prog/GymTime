'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden font-sans">
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-800 rounded-xl flex items-center justify-center font-black text-xl italic tracking-tighter shadow-lg shadow-violet-600/20">
                            GT
                        </div>
                        <span className="text-2xl font-black tracking-tight">GymTime</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
                        <Link href="#features" className="hover:text-white transition-colors cursor-pointer" scroll={true}>Funcionalidades</Link>
                        <Link href="#admin" className="hover:text-white transition-colors cursor-pointer" scroll={true}>Admin Panel</Link>
                        <Link href="#demo" className="hover:text-white transition-colors cursor-pointer" scroll={true}>Contacto</Link>
                    </div>

                    <Link
                        href="https://wa.me/17866941642"
                        target="_blank"
                        className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-white/90 transition-all active:scale-95"
                    >
                        Empezar
                    </Link>
                </div>
            </nav>

            {/* Animated Background */}
            <div className="fixed inset-0 opacity-30 pointer-events-none">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full blur-[250px]"
                    style={{
                        background: 'radial-gradient(circle, #7c3aed40 0%, #6366f120 40%, transparent 70%)',
                        transform: `translateX(-50%) translateY(${scrollY * 0.3}px)`
                    }}
                />
                <div
                    className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-[200px]"
                    style={{
                        background: 'radial-gradient(circle, #3b82f630 0%, transparent 70%)',
                        transform: `translateY(${-scrollY * 0.2}px)`
                    }}
                />
            </div>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Text */}
                    <div className="space-y-8">
                        <h1 className="text-6xl lg:text-7xl font-black leading-tight">
                            Tu gimnasio,
                            <br />
                            <span className="bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
                                más inteligente
                            </span>
                        </h1>
                        <p className="text-xl text-white/70 leading-relaxed max-w-lg">
                            GymTime revoluciona la gestión de tu gimnasio con carnets digitales,
                            control de asistencias y una experiencia premium para tus socios.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="https://wa.me/17866941642"
                                target="_blank"
                                className="bg-violet-600 hover:bg-violet-500 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-105"
                            >
                                WhatsApp Directo
                            </Link>
                            <Link
                                href="#features"
                                className="border-2 border-white/20 hover:border-white/40 px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:bg-white/5"
                            >
                                Conocer más
                            </Link>
                        </div>
                    </div>

                    {/* Right: Mockup Stack */}
                    <div className="relative h-[600px] flex items-center justify-center">
                        {/* Shadow/Glow Background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/30 blur-[120px] rounded-full animate-pulse" />

                        {/* Secondary Mockup (Left - Store) */}
                        <div className="absolute left-[5%] top-[15%] w-[240px] -rotate-[12deg] z-10 opacity-40 hover:opacity-100 hover:scale-110 hover:-rotate-0 transition-all duration-700 hidden lg:block">
                            <Image
                                src="/landing/pwa_store.png"
                                alt="Tienda"
                                width={240}
                                height={480}
                                className="rounded-[2.5rem] shadow-2xl border border-white/10"
                            />
                        </div>

                        {/* Main Mockup (Center - Birthday) */}
                        <div className="relative z-30 w-[320px] hover:scale-105 transition-transform duration-700">
                            <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-[3rem] -z-10" />
                            <Image
                                src="/landing/pwa_home_birthday.png"
                                alt="GymTime PWA"
                                width={320}
                                height={640}
                                className="rounded-[3rem] shadow-2xl shadow-black/80 border-4 border-white/5"
                                priority
                            />
                        </div>

                        {/* Secondary Mockup (Right - Carnet) */}
                        <div className="absolute right-[5%] bottom-[15%] w-[240px] rotate-[12deg] z-10 opacity-40 hover:opacity-100 hover:scale-110 hover:rotate-0 transition-all duration-700 hidden lg:block">
                            <Image
                                src="/landing/pwa_carnet.png"
                                alt="Carnet Digital"
                                width={240}
                                height={480}
                                className="rounded-[2.5rem] shadow-2xl border border-white/10"
                            />
                        </div>

                        {/* Floating Badges */}
                        <div className="absolute top-[10%] right-[15%] bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl z-40 hidden xl:flex items-center gap-2 animate-bounce">
                            <span className="text-violet-400">✨</span>
                            <span className="text-xs font-bold uppercase tracking-tight">Premium Experience</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features PWA Section */}
            <section id="features" className="relative py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl font-black mb-6">
                            Experiencia Premium para tus Socios
                        </h2>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto">
                            Un carnet digital que tus socios llevarán siempre en su bolsillo
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1: Membership Status */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all group-hover:scale-105">
                                <div className="aspect-[9/16] relative mb-4 rounded-2xl overflow-hidden">
                                    <Image
                                        src="/landing/pwa_paused.png"
                                        alt="Estado de Membresía"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Estado en Tiempo Real</h3>
                                <p className="text-white/60 text-sm">
                                    Notificaciones inteligentes sobre vencimientos y renovaciones
                                </p>
                            </div>
                        </div>

                        {/* Feature 2: Digital Carnet */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all group-hover:scale-105">
                                <div className="aspect-[9/16] relative mb-4 rounded-2xl overflow-hidden">
                                    <Image
                                        src="/landing/pwa_carnet.png"
                                        alt="Carnet Digital"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Carnet Digital QR</h3>
                                <p className="text-white/60 text-sm">
                                    Acceso rápido sin contacto mediante código QR único
                                </p>
                            </div>
                        </div>

                        {/* Feature 3: Attendance Tracking */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all group-hover:scale-105">
                                <div className="aspect-[9/16] relative mb-4 rounded-2xl overflow-hidden">
                                    <Image
                                        src="/landing/pwa_attendance.png"
                                        alt="Calendario de Asistencias"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Seguimiento de Progreso</h3>
                                <p className="text-white/60 text-sm">
                                    Calendario visual con heatmap de asistencias y rutinas
                                </p>
                            </div>
                        </div>

                        {/* Feature 4: Store */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all group-hover:scale-105">
                                <div className="aspect-[9/16] relative mb-4 rounded-2xl overflow-hidden">
                                    <Image
                                        src="/landing/pwa_store.png"
                                        alt="Tienda"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Tienda Integrada</h3>
                                <p className="text-white/60 text-sm">
                                    Vende productos y suplementos directamente desde la app
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Admin Panel Section */}
            <section id="admin" className="relative py-32 px-6 bg-gradient-to-b from-black to-violet-950/20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="bg-violet-600/20 text-violet-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block border border-violet-500/20">Dashboard Experience</span>
                        <h2 className="text-5xl font-black mb-6">
                            Control Total de tu Recepción
                        </h2>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto">
                            Gestiona socios, pagos y accesos con el sistema más intuitivo y real del mercado.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Main Large Mockup - Members (Primary focus) */}
                        <div className="relative z-20 rounded-[2rem] overflow-hidden shadow-2xl shadow-violet-500/10 border border-white/10 group bg-black/40 backdrop-blur-sm">
                            <Image
                                src="/landing/admin_members.png"
                                alt="Gestión de Miembros GymTime"
                                width={1400}
                                height={800}
                                className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-1000 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8 md:p-12">
                                <div className="max-w-lg">
                                    <h3 className="text-3xl font-bold mb-3 text-white">Visualización en Tiempo Real</h3>
                                    <p className="text-white/60 leading-relaxed">
                                        Toda la información operativa de tu gimnasio en una pantalla diseñada para la eficiencia. Atiende a tus socios sin esperas.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements to create depth */}
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-violet-600/20 blur-[100px] rounded-full z-10" />
                        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/10 blur-[120px] rounded-full z-10" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mt-12">
                        {/* Secondary Feature: Scanner */}
                        <div className="group relative">
                            <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 transition-all group-hover:bg-white/[0.05] overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm7-11h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 15h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z" /></svg>
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold mb-4">Escáner de Acceso Inteligente</h3>
                                    <p className="text-white/60 mb-8 max-w-md">
                                        Registro instantáneo de entradas. Valida membresías y fotos de perfil en segundos para una seguridad total.
                                    </p>
                                    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl group-hover:scale-105 transition-transform duration-500">
                                        <Image
                                            src="/landing/admin_scanner.png"
                                            alt="Escáner QR"
                                            width={800}
                                            height={500}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Secondary Feature: Payments */}
                        <div className="group relative">
                            <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 transition-all group-hover:bg-white/[0.05] overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.97 0-1.8 1.37-3.28 3.11-3.7V3.5h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.61-2.4 1.61 0 .92.61 1.4 2.67 1.94 2.5.6 4.18 1.7 4.18 4.1 0 1.86-1.35 3.12-3.12 3.57z" /></svg>
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold mb-4">Control de Ingresos</h3>
                                    <p className="text-white/60 mb-8 max-w-md">
                                        Historial de pagos detallado y reportes financieros para que el crecimiento de tu gimnasio sea medible.
                                    </p>
                                    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl group-hover:scale-105 transition-transform duration-500">
                                        <Image
                                            src="/landing/admin_payments.png"
                                            alt="Historial de Pagos"
                                            width={800}
                                            height={500}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section id="demo" className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl lg:text-6xl font-black mb-8">
                        ¿Listo para transformar
                        <br />
                        <span className="bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
                            tu gimnasio?
                        </span>
                    </h2>
                    <p className="text-2xl text-white/70 mb-12 max-w-2xl mx-auto">
                        Únete a los gimnasios que ya están usando GymTime para ofrecer
                        una experiencia premium a sus socios
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <a
                            href="https://wa.me/17866941642"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-500 px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-105 flex items-center justify-center gap-3"
                        >
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Agendar Demo WhatsApp
                        </a>
                        <a
                            href="mailto:hola@gymtime.app"
                            className="border-2 border-white/20 hover:border-white/40 px-10 py-5 rounded-2xl font-bold text-xl transition-all hover:bg-white/5 flex items-center justify-center gap-3"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Contactar por Email
                        </a>
                    </div>
                </div>
            </section>

            {/* Floating WhatsApp Button (Mobile) */}
            <a
                href="https://wa.me/17866941642"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white p-4 rounded-full shadow-2xl shadow-emerald-500/50 hover:scale-110 transition-all md:hidden animate-bounce"
            >
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </a>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-white/40 text-sm">
                        © 2026 GymTime. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
