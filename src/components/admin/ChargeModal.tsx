'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { createPayment } from '@/app/actions/payments';
import { useRouter } from 'next/navigation';

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

export default function ChargeModal({
    memberId,
    memberName,
    planAmount = 0,
    planName = 'Mensualidad',
    products = [],
    plans = [],
    currency,
    onClose
}: {
    memberId: string,
    memberName: string,
    planAmount?: number,
    planName?: string,
    products: Product[],
    plans: Plan[],
    currency: string,
    onClose: () => void
}) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    // State
    const [renewMembership, setRenewMembership] = useState(false);
    const [cart, setCart] = useState<{ product_id: string, name: string, price: number, quantity: number }[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    // Deduplicate plans for dropdown
    const uniquePlans = useMemo(() => plans.filter((plan, index, self) =>
        index === self.findIndex((p) => (
            p.name === plan.name &&
            p.price === plan.price &&
            p.duration_days === plan.duration_days
        ))
    ), [plans]);

    useEffect(() => {
        setMounted(true);
        // Only initialize if we haven't selected one yet OR if the filtered list changed significantly
        // But better is to just initialize once based on props

        const matchingPlan = uniquePlans.find(p => p.name === planName);
        if (matchingPlan) {
            setSelectedPlanId(matchingPlan.id);
        } else if (uniquePlans.length > 0) {
            setSelectedPlanId(uniquePlans[0].id);
        }
        return () => setMounted(false);
        // We only want to run this initialization when the modal opens or uniquePlans changes (which should be stable now)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uniquePlans, planName]);

    const selectedPlan = plans.find(p => p.id === selectedPlanId);

    // Derived totals
    const membershipTotal = renewMembership ? (selectedPlan?.price ?? planAmount) : 0;
    const productsTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const grandTotal = membershipTotal + productsTotal;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToCart = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        setCart(prev => {
            const existing = prev.find(item => item.product_id === productId);
            if (existing) {
                return prev.map(item =>
                    item.product_id === productId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                product_id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    const handleProcessPayment = async () => {
        if (grandTotal <= 0) return;
        setSubmitting(true);

        const formData = new FormData();
        formData.append('member_id', memberId);
        formData.append('amount', grandTotal.toString());
        formData.append('type', renewMembership && cart.length > 0 ? 'MIXED' : (renewMembership ? 'MEMBERSHIP' : 'PRODUCT'));

        if (renewMembership) {
            formData.append('renew_membership', 'true');
            formData.append('membership_amount', (selectedPlan?.price ?? planAmount).toString());

            if (selectedPlan) {
                // Pass the new plan details to update the membership
                formData.append('new_plan_name', selectedPlan.name);
                formData.append('new_plan_days', selectedPlan.duration_days.toString());
            }
        }

        if (cart.length > 0) {
            formData.append('cart', JSON.stringify(cart));
        }

        const result = await createPayment(formData);

        if (result.success) {
            router.refresh(); // Refresh server data
            onClose();
        } else {
            alert('Error al procesar pago: ' + result.error);
            setSubmitting(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-white">Cobrar a {memberName}</h2>
                        <p className="text-white/40 text-sm">Selecciona los ítems a cobrar</p>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">✕</button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFT COL: SELECTION */}
                    <div className="space-y-6">
                        {/* 1. Membership Renewal */}
                        <div
                            className={`p-4 rounded-xl border transition-all ${renewMembership ? 'bg-brand-500/10 border-brand-500' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                        >
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setRenewMembership(!renewMembership)}>
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${renewMembership ? 'bg-brand-500 border-brand-500' : 'border-white/30'}`}>
                                    {renewMembership && <span className="text-white text-xs">✓</span>}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-white">Renovar Membresía</div>
                                    {!renewMembership && <div className="text-xs text-white/50">{planName}</div>}
                                </div>
                                {!renewMembership && <div className="font-mono font-bold text-brand-400">{currency}{planAmount}</div>}
                            </div>

                            {renewMembership && (
                                <div className="mt-4 pt-4 border-t border-white/10 animate-in slide-in-from-top-2">
                                    <select
                                        value={selectedPlanId}
                                        onChange={(e) => setSelectedPlanId(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {uniquePlans.length > 0 ? uniquePlans.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} - {currency}{p.price}</option>
                                        )) : (
                                            // Fallback if no plans
                                            <option value="">{planName} - {currency}{planAmount}</option>
                                        )}
                                    </select>
                                    <div className="mt-2 text-right font-mono font-bold text-brand-400">
                                        {currency}{selectedPlan?.price || planAmount}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Products */}
                        <div className="flex flex-col h-[300px]">
                            <h3 className="text-sm font-bold text-white/60 mb-3 uppercase tracking-wider">Agregar Productos</h3>

                            <input
                                type="text"
                                placeholder="🔍 Buscar producto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500 mb-3 transition-colors placeholder:text-white/20"
                            />

                            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 gap-2 content-start custom-scrollbar">
                                {filteredProducts.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => addToCart(product.id)}
                                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-left transition-all active:scale-95 h-20 flex flex-col justify-between"
                                    >
                                        <div className="text-sm font-bold text-white line-clamp-2">{product.name}</div>
                                        <div className="text-xs text-brand-400 font-mono">{currency}{product.price}</div>
                                    </button>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <div className="col-span-2 text-center text-white/20 text-xs py-4">
                                        {products.length === 0 ? 'No hay productos' : 'No se encontraron resultados'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COL: SUMMARY */}
                    <div className="bg-black/30 rounded-2xl p-6 flex flex-col h-full border border-white/5">
                        <h3 className="text-sm font-bold text-white/40 mb-4 uppercase tracking-widest">Resumen de Compra</h3>

                        <div className="flex-1 space-y-3 overflow-y-auto max-h-[200px] mb-4 custom-scrollbar">
                            {renewMembership && (
                                <div className="flex justify-between items-center text-sm animate-in slide-in-from-left-2">
                                    <div className="text-white">
                                        <div className="font-bold">Renovación Membresía</div>
                                        <div className="text-xs text-brand-400">{selectedPlan?.name || planName}</div>
                                    </div>
                                    <div className="font-mono text-white/60">{currency}{selectedPlan?.price || planAmount}</div>
                                </div>
                            )}

                            {cart.map((item) => (
                                <div key={item.product_id} className="flex justify-between items-center text-sm group animate-in slide-in-from-left-2">
                                    <div className="text-white flex items-center gap-2">
                                        <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                        <span>{item.quantity}x {item.name}</span>
                                    </div>
                                    <div className="font-mono text-white/60">{currency}{item.price * item.quantity}</div>
                                </div>
                            ))}

                            {!renewMembership && cart.length === 0 && (
                                <div className="text-center text-white/20 text-sm py-8 italic">
                                    Nada seleccionado
                                </div>
                            )}
                        </div>

                        <div className="border-t border-white/10 pt-4 mt-auto">
                            <div className="flex justify-between items-end mb-6">
                                <span className="text-white/50 text-sm">Total a Pagar</span>
                                <span className="text-3xl font-black text-white tracking-tighter">{currency}{grandTotal.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handleProcessPayment}
                                disabled={grandTotal <= 0 || submitting}
                                className="w-full py-4 bg-brand-500 hover:bg-brand-400 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? 'Procesando...' : (
                                    <>
                                        <span>Confirmar Cobro</span>
                                        <span>→</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
