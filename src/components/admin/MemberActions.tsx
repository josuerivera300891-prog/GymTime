'use client';

import { useState } from 'react';
import ChargeModal from './ChargeModal';
import EditMemberModal from './EditMemberModal';
import { deleteMember } from '@/app/actions/updateMember';
import { useRouter } from 'next/navigation';

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

type Plan = {
    id: string;
    name: string;
    price: number;
    duration_days: number;
};

export default function MemberActions({
    member,
    membership,
    products = [],
    plans = [],
    currency
}: {
    member: MemberWithAuth,
    membership: Membership,
    products: Product[],
    plans: Plan[],
    currency: string
}) {
    const [showChargeModal, setShowChargeModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    // Prepare message
    const tenantName = 'nuestro gimnasio'; // Could be passed as prop
    const whatsappLink = `https://wa.me/${member.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
        `¡Hola ${member.name}! Bienvenid@ a ${tenantName}. 🏋️‍♂️\n\nPuedes acceder a tu tarjeta digital y ver tus asistencias aquí: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/c?token=${member.auth_token}`
    )}`;

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que deseas eliminar este miembro? Esta acción no se puede deshacer.')) return;

        setIsDeleting(true);
        const result = await deleteMember(member.id);
        if (result.success) {
            router.refresh();
        } else {
            alert(result.error);
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="flex items-center justify-end gap-2 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                {/* WhatsApp Button */}
                {member.auth_token && (
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center bg-[#25D366] text-white rounded-full hover:bg-[#20bd5a] hover:scale-105 transition-all shadow-lg shadow-[#25D366]/20"
                        title="Enviar Tarjeta Digital"
                    >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                    </a>
                )}

                {/* Edit Button */}
                <button
                    onClick={() => setShowEditModal(true)}
                    className="w-8 h-8 flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-full hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"
                    title="Editar Miembro"
                >
                    ✏️
                </button>

                {/* Delete Button */}
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all border border-red-500/20 disabled:opacity-50"
                    title="Eliminar Miembro"
                >
                    🗑️
                </button>

                {/* Charge Button */}
                <button
                    onClick={() => setShowChargeModal(true)}
                    className="bg-brand-500 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl h-8 ml-2 hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/20"
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
                    plans={plans}
                    currency={currency}
                    onClose={() => setShowChargeModal(false)}
                />
            )}

            {showEditModal && (
                <EditMemberModal
                    member={member}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </>
    );
}
