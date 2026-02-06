'use client';

import { useState } from 'react';
import ProductModal from '@/components/admin/ProductModal';
import { deleteProduct } from '@/app/actions/products';

type Product = {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    image_url?: string;
    active: boolean;
};

export default function ProductManagement({ products, currency, tenantId }: { products: Product[], currency: string, tenantId: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            await deleteProduct(id);
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 p-8 rounded-[40px] border border-white/10 relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-brand-500/20 transition-all duration-700"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-brand-500/20 rounded-2xl flex items-center justify-center text-2xl">🏪</div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Tienda Virtual</h1>
                    </div>
                    <p className="text-white/50 text-sm max-w-md">Transforma tu inventario en un catálogo premium para tus miembros.</p>
                </div>

                <button
                    onClick={handleCreate}
                    className="relative z-10 btn-primary flex items-center gap-3 px-8 py-4 !rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                    <span className="text-xl">+</span> Agregar Producto
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                    <div key={product.id} className="glass-card !p-0 group rounded-[32px] overflow-hidden flex flex-col hover:border-brand-500/30 transition-all duration-500 shadow-xl hover:shadow-brand-500/10">
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden bg-white/5">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-white/10 italic">
                                    <span className="text-4xl mb-2 opacity-20">📸</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest">Sin imagen</span>
                                </div>
                            )}

                            {/* Stock Badge */}
                            <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${product.stock > 5 ? 'text-white/70' : 'text-red-400'}`}>
                                    {product.stock} unids.
                                </span>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="mb-2">
                                <h3 className="text-xl font-black uppercase tracking-tight text-white leading-tight truncate group-hover:text-brand-400 transition-colors">
                                    {product.name}
                                </h3>
                                <div className="text-2xl font-black mt-1" style={{ color: 'var(--brand-primary, #E6007E)' }}>
                                    {currency}{Number(product.price).toLocaleString()}
                                </div>
                            </div>

                            <p className="text-white/40 text-xs line-clamp-2 mb-6 font-medium italic">
                                {product.description || 'Sin descripción disponible.'}
                            </p>

                            <div className="mt-auto flex items-center gap-3">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:border-white/20 active:scale-95"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 py-3 rounded-xl text-red-500/60 hover:text-red-500 transition-all hover:border-red-500/30 active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <div className="col-span-full py-32 text-center">
                        <div className="text-6xl mb-6 opacity-20">🛒</div>
                        <h3 className="text-2xl font-black uppercase tracking-widest text-white/30">Tu tienda está vacía</h3>
                        <p className="text-white/20 mt-2 max-w-sm mx-auto italic">Comienza agregando productos premium para que tus miembros los vean en la app.</p>
                    </div>
                )}
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                productToEdit={editingProduct}
                currency={currency}
                tenantId={tenantId}
            />
        </div>
    );
}
