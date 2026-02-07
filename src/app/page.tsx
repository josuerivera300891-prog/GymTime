import Link from 'next/link';
import Image from 'next/image';

// SVG Icons components
const Icons = {
  users: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  payment: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  chart: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  mobile: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
  bell: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  document: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  ),
  cart: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  ),
  qrcode: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
    </svg>
  ),
};

const features = [
  {
    icon: Icons.users,
    title: 'Gestión de Miembros',
    description: 'Control completo de membresías, estados de pago y datos de contacto.'
  },
  {
    icon: Icons.payment,
    title: 'Cobros y Pagos',
    description: 'Registro de pagos, historial financiero y alertas de vencimiento.'
  },
  {
    icon: Icons.chart,
    title: 'Reportes en Tiempo Real',
    description: 'Métricas de ingresos, asistencia y crecimiento de tu gimnasio.'
  },
  {
    icon: Icons.mobile,
    title: 'App para Clientes',
    description: 'PWA móvil donde tus socios ven su membresía y código QR.'
  },
  {
    icon: Icons.bell,
    title: 'Notificaciones',
    description: 'Push notifications y WhatsApp para recordatorios de pago.'
  },
  {
    icon: Icons.document,
    title: 'Planes Flexibles',
    description: 'Crea planes mensuales, trimestrales o personalizados.'
  },
  {
    icon: Icons.cart,
    title: 'Venta de Productos',
    description: 'Gestiona tu tienda de suplementos y accesorios.'
  },
  {
    icon: Icons.qrcode,
    title: 'Control de Asistencia',
    description: 'Escaneo QR para registro de entradas y salidas.'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/30 via-transparent to-purple-900/20 pointer-events-none" />
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-brand-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white/60">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              GymTime · Plataforma de gestión para gimnasios
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                Gestiona tu
              </span>
              <br />
              <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-purple-500 bg-clip-text text-transparent">
                Gimnasio
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 max-w-xl font-light leading-relaxed">
              Control total de membresías, pagos, asistencia y notificaciones.
              Todo en una plataforma moderna y fácil de usar.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-105 active:scale-95"
              >
                <span>Iniciar Sesión</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-4 px-8 rounded-2xl transition-all hover:scale-105 active:scale-95"
              >
                Ver funciones
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 max-w-md mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">100%</div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Cloud</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">24/7</div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Disponible</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">PWA</div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Móvil</div>
              </div>
            </div>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/20 to-purple-500/20 blur-3xl opacity-50" />

              {/* Dashboard image */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-brand-500/10">
                <Image
                  src="/images/dashboard-mockup.png"
                  alt="GymTime Dashboard"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                  priority
                />
              </div>

              {/* Mobile mockup floating */}
              <div className="absolute -bottom-8 -left-8 w-40 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/20 transform hover:scale-105 transition-transform">
                <Image
                  src="/images/mobile-mockup.png"
                  alt="GymTime Mobile App"
                  width={160}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="text-brand-500 font-bold text-sm uppercase tracking-widest">Funcionalidades</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6 text-white">
              Todo lo que necesitas
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Una solución completa para la gestión de tu gimnasio, desde el control de miembros hasta reportes financieros.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-brand-500/30 hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="text-brand-400 mb-4 group-hover:scale-110 group-hover:text-brand-300 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-900/10 to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Mobile Preview */}
            <div className="relative flex justify-center lg:order-1">
              <div className="relative">
                <div className="absolute -inset-8 bg-gradient-to-r from-purple-500/20 to-brand-500/20 blur-3xl opacity-40" />
                <div className="relative w-64 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <Image
                    src="/images/mobile-mockup.png"
                    alt="App para socios"
                    width={256}
                    height={512}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6 lg:order-0">
              <span className="text-brand-500 font-bold text-sm uppercase tracking-widest">App para clientes</span>
              <h2 className="text-3xl md:text-4xl font-black text-white">
                Tus socios siempre conectados
              </h2>
              <p className="text-white/50 text-lg leading-relaxed">
                Una PWA móvil donde tus clientes pueden ver su membresía, código QR de acceso, historial de pagos y recibir notificaciones importantes.
              </p>
              <ul className="space-y-3">
                {['Código QR para check-in', 'Estado de membresía', 'Historial de pagos', 'Notificaciones push'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/70">
                    <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/20 to-transparent pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            ¿Listo para empezar?
          </h2>
          <p className="text-white/50 mb-10 text-lg">
            Accede a tu panel de administración y comienza a gestionar tu gimnasio de forma profesional.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-4 px-12 rounded-2xl transition-all shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-105 active:scale-95 text-lg"
          >
            Iniciar Sesión
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <span className="text-sm font-black text-white">G</span>
            </div>
            <span className="font-bold text-white/80">GymTime</span>
          </div>
          <p className="text-xs text-white/20">
            © 2026 GymTime. Powered by Skala Marketing.
          </p>
        </div>
      </footer>
    </div>
  );
}
