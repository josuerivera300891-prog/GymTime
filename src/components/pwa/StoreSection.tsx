import React, { useState } from 'react';

interface StoreSectionProps {
    products: any[];
    member: any;
    primaryColor: string;
}

export const StoreSection: React.FC<StoreSectionProps> = ({ products, member, primaryColor }) => {
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [activeImage, setActiveImage] = useState(0);

    const handleWhatsAppBuy = (product: any) => {
        const phone = member.tenants?.phone || '505'; // Default or from tenant
        const priceInfo = `${member.tenants.currency_symbol}${product.price}${product.price_usd ? ` / $${product.price_usd}` : ''}`;
        const message = `¡Hola! Me interesa este producto de la tienda: *${product.name}* (${priceInfo}). ¿Tienen disponibilidad?`;
        const waUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

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
                    <div
                        key={product.id}
                        onClick={() => {
                            setSelectedProduct(product);
                            setActiveImage(0);
                        }}
                        className="glass-card !p-0 overflow-hidden flex flex-col group active:scale-[0.98] transition-all cursor-pointer"
                    >
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

                            <div className="mt-auto">
                                <div className="text-sm font-black" style={{ color: primaryColor }}>
                                    {member.tenants.currency_symbol}{Number(product.price).toLocaleString()}
                                </div>
                                {product.price_usd && (
                                    <div className="text-[10px] font-black text-white/60">
                                        ${Number(product.price_usd).toLocaleString()} USD
                                    </div>
                                )}
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

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />
                    <div className="relative w-full max-w-md bg-[#0a0a0a] rounded-t-[40px] border-t border-white/10 p-6 pb-12 animate-in slide-in-from-bottom-full duration-500 overflow-hidden">
                        {/* Drag Handle */}
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" onClick={() => setSelectedProduct(null)} />

                        {/* Images Carousel */}
                        <div className="relative mb-6">
                            <div className="aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10">
                                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                                    <img
                                        src={selectedProduct.images[activeImage]}
                                        className="w-full h-full object-cover animate-in fade-in duration-500"
                                        alt={selectedProduct.name}
                                    />
                                ) : (
                                    <img src={selectedProduct.image_url} className="w-full h-full object-cover" alt={selectedProduct.name} />
                                )}
                            </div>

                            {/* Image Nav Dots */}
                            {selectedProduct.images && selectedProduct.images.length > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    {selectedProduct.images.map((_: any, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeImage ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Text Content */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <h2 className="text-2xl font-black uppercase tracking-tight max-w-[60%] leading-tight">
                                    {selectedProduct.name}
                                </h2>
                                <div className="text-right">
                                    <div className="text-xl font-black" style={{ color: primaryColor }}>
                                        {member.tenants.currency_symbol}{Number(selectedProduct.price).toLocaleString()}
                                    </div>
                                    {selectedProduct.price_usd && (
                                        <div className="text-xs font-black text-white/40">
                                            ${Number(selectedProduct.price_usd).toLocaleString()} USD
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-white/50 leading-relaxed italic">
                                {selectedProduct.description || 'No hay descripción disponible para este producto. Calidad garantizada por Gym Nica.'}
                            </p>

                            <div className="flex items-center gap-2 py-2">
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60">
                                    Stock: {selectedProduct.stock} Unidades
                                </span>
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60">
                                    Premium Quality
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 space-y-3">
                                <button
                                    onClick={() => handleWhatsAppBuy(selectedProduct)}
                                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98]"
                                    style={{ backgroundColor: primaryColor, color: '#000' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                    Comprar vía WhatsApp
                                </button>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-widest text-xs text-white/40 active:scale-[0.98] transition-all"
                                >
                                    Volver al catálogo
                                </button>
                            </div>
                        </div>
                    </div>
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
