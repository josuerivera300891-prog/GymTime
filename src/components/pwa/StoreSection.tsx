'use client';

import React from 'react';

interface StoreSectionProps {
    products: any[];
    member: any;
    primaryColor: string;
}

export const StoreSection: React.FC<StoreSectionProps> = ({ products, member, primaryColor }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex justify-between items-center mb-2 px-2">
                <h3 className="text-xl font-black uppercase tracking-tight">Catálogo</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                    {products.length} Productos
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="glass-card !p-0 overflow-hidden flex flex-col group active:scale-[0.98] transition-all">
                        <div className="relative aspect-square bg-white/5 flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="text-3xl opacity-20">
                                    📦
                                </div>
                            )}
                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                                <span className="text-[9px] font-black text-white/70 tracking-widest uppercase">
                                    {product.stock} disp.
                                </span>
                            </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                            <h4 className="text-sm font-black uppercase tracking-tight line-clamp-1 mb-1">{product.name}</h4>
                            <p className="text-[9px] text-white/40 italic line-clamp-1 mb-3">{product.description || 'Calidad premium.'}</p>

                            <div className="mt-auto flex items-center justify-between">
                                <div className="text-base font-black" style={{ color: primaryColor }}>
                                    {member.tenants.currency_symbol}{Number(product.price).toLocaleString()}
                                </div>
                                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-brand-500/20 group-hover:border-brand-500/50 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && (
                <div className="py-20 text-center glass-card">
                    <div className="text-5xl mb-4 opacity-20">🏪</div>
                    <p className="text-white/30 text-xs font-black uppercase tracking-[0.2em]">Tienda cerrada temporalmente</p>
                    <p className="text-white/20 text-[10px] mt-1 italic tracking-widest">Pronto tendremos novedades para ti.</p>
                </div>
            )}

            {/* Store Info Footer */}
            <div className="text-center py-4">
                <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.2em] max-w-[200px] mx-auto italic">
                    * Compra directamente en recepción mostrando tu código QR
                </p>
            </div>
        </div>
    );
};
