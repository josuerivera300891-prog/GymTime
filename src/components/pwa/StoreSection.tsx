import React, { useState, useRef, useEffect } from 'react';

interface StoreSectionProps {
    products: any[];
    member: any;
    primaryColor: string;
}

export const StoreSection: React.FC<StoreSectionProps> = ({ products, member, primaryColor }) => {
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [activeImage, setActiveImage] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Reset scroll when changing product
    useEffect(() => {
        if (selectedProduct) {
            setActiveImage(0);
        }
    }, [selectedProduct]);

    const handleWhatsAppBuy = (product: any) => {
        const phone = member.tenants?.phone || '505'; // Default or from tenant
        const priceInfo = `${member.tenants.currency_symbol}${product.price}${product.price_usd ? ` / $${product.price_usd}` : ''}`;
        const message = `¡Hola! Me interesa este producto de la tienda: *${product.name}* (${priceInfo}). ¿Tienen disponibilidad?`;
        const waUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    const handleScroll = () => {
        if (scrollRef.current) {
            const scrollPosition = scrollRef.current.scrollLeft;
            const width = scrollRef.current.offsetWidth;
            const newActiveImage = Math.round(scrollPosition / width);
            setActiveImage(newActiveImage);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
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
                        onClick={() => setSelectedProduct(product)}
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
                </div>
            )}

            {/* Product Detail Modal - Full Screen Style */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                    {/* Header with Close Button */}
                    <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                                Detalle
                            </span>
                        </div>
                        <div className="w-10" /> {/* Spacer */}
                    </div>

                    {/* Main Scrollable Content */}
                    <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
                        {/* Hero Image Carousel - 55% Height */}
                        <div className="relative h-[55vh] w-full bg-[#050505]">
                            <div
                                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
                                ref={scrollRef}
                                onScroll={handleScroll}
                            >
                                {(selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images : [selectedProduct.image_url]).map((img: string, idx: number) => (
                                    <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                                        <img
                                            src={img}
                                            className="w-full h-full object-contain"
                                            alt={`${selectedProduct.name} - ${idx + 1}`}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 pointer-events-none" />
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Dots */}
                            {(selectedProduct.images?.length > 1) && (
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                                    {selectedProduct.images.map((_: any, i: number) => (
                                        <div
                                            key={i}
                                            className={`h-1.5 rounded-full transition-all duration-300 shadow-lg ${i === activeImage ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="px-6 -mt-4 relative z-10">
                            <h1 className="text-3xl font-black uppercase tracking-tight leading-none mb-3 drop-shadow-lg">
                                {selectedProduct.name}
                            </h1>

                            <div className="flex items-baseline gap-3 mb-6">
                                <span className="text-2xl font-black" style={{ color: primaryColor }}>
                                    {member.tenants.currency_symbol}{Number(selectedProduct.price).toLocaleString()}
                                </span>
                                {selectedProduct.price_usd && (
                                    <span className="text-sm font-bold text-white/50">
                                        / ${Number(selectedProduct.price_usd).toLocaleString()} USD
                                    </span>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/70">
                                    Stock: {selectedProduct.stock}
                                </span>
                                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/70">
                                    Premium
                                </span>
                            </div>

                            {/* Description */}
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 mb-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-3">Descripción</h3>
                                <p className="text-sm text-white/70 leading-relaxed font-medium">
                                    {selectedProduct.description || 'Producto de alta calidad seleccionado especialmente para tu entrenamiento.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent z-30 pb- safe-area-bottom">
                        <button
                            onClick={() => handleWhatsAppBuy(selectedProduct)}
                            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                            style={{
                                backgroundColor: primaryColor,
                                color: '#000000',
                                boxShadow: `0 10px 30px -10px ${primaryColor}66`
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                            Comprar por WhatsApp
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
