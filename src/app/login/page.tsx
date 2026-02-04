export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="text-4xl font-black text-brand-500 mb-2">GymTime</div>
                    <p className="text-white/40">SaaS Multi-tenant de Membresías</p>
                </div>

                <div className="glass-card space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Correo Electrónico</label>
                        <input type="email" placeholder="email@ejemplo.com" className="input-field w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Contraseña</label>
                        <input type="password" placeholder="••••••••" className="input-field w-full" />
                    </div>

                    <div className="space-y-4 pt-4">
                        <button className="btn-primary w-full !py-3">Entrar al Panel</button>
                        <div className="text-center">
                            <a href="#" className="text-xs text-white/30 hover:text-brand-400">¿Olvidaste tu contraseña?</a>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-white/20 mt-10">
                    POWERED BY <b>SKALA MARKETING</b>
                </p>
            </div>
        </div>
    );
}
