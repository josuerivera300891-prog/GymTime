import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-10">
      <div className="text-center">
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">GymTime</h1>
        <p className="text-xl text-white/50">Tu plataforma SaaS para gestión de gimnasios.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <Link href="/superadmin" className="glass-card hover:border-brand-500/50 transition-all group">
          <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🚀</div>
          <h2 className="text-xl font-bold mb-2">Super Admin</h2>
          <p className="text-sm text-white/40">Gestión global de gyms (Skala Marketing).</p>
        </Link>

        <Link href="/admin" className="glass-card hover:border-brand-500/50 transition-all group">
          <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🏢</div>
          <h2 className="text-xl font-bold mb-2">Admin de Gym</h2>
          <p className="text-sm text-white/40">Gestión de miembros y pagos de tu gym.</p>
        </Link>

        <Link href="/c" className="glass-card hover:border-brand-500/50 transition-all group text-brand-400 border-brand-500/20">
          <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">📱</div>
          <h2 className="text-xl font-bold mb-2">PWA Cliente</h2>
          <p className="text-sm text-white/40">Vista móvil para socios del gimnasio.</p>
        </Link>
      </div>
    </div>
  );
}
