'use client';

import { useState } from 'react';
import ChargeModal from './ChargeModal';

type MemberWithAuth = {
    id: string;
    name: string;
    phone: string;
    auth_token: string;
};

type Membership = {
    amount: number;
    plan_name: string;
};

type Product = {
    id: string;
    name: string;
    price: number;
};

export default function MemberActions({
    member,
    membership,
    products = []
}: {
    member: MemberWithAuth,
    membership: Membership,
    products: Product[]
}) {
    const [showChargeModal, setShowChargeModal] = useState(false);

    // Prepare message
    const tenantName = 'nuestro gimnasio'; // Could be passed as prop
    const whatsappLink = `https://wa.me/${member.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
        `¡Hola ${member.name}! Bienvenid@ a ${tenantName}. 🏋️‍♂️\n\nPuedes acceder a tu tarjeta digital y ver tus asistencias aquí: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/c?token=${member.auth_token}`
    )}`;

    return (
        <>
            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                {member.auth_token && (
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center bg-green-500/10 text-green-400 rounded-full hover:bg-green-500 hover:text-black transition-all"
                        title="Enviar Tarjeta Digital"
                    >
                        <span className="text-lg">💬</span>
                    </a>
                )}

                <button
                    onClick={() => setShowChargeModal(true)}
                    className="bg-brand-500 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl h-10 hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/20"
                >
                    Cobrar
                </button>
            </div>

            {showChargeModal && (
                <ChargeModal
                    memberId={member.id}
                    memberName={member.name}
                    planAmount={membership.amount || 0}
                    planName={membership.plan_name}
                    products={products}
                    onClose={() => setShowChargeModal(false)}
                />
            )}
        </>
    );
}
