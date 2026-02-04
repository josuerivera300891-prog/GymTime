'use client';

import { useState } from 'react';
import ProductModal from '@/components/admin/ProductModal';
import { deleteProduct } from '@/app/actions/products';

type Product = {
    id: string;
    name: string;
    price: number;
    stock: number;
    active: boolean;
};

export default function ProductManagement({ products }: { products: Product[] }) {
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
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white/5 p-8 rounded-3xl border border-white/10">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Inventario</h1>
                    <p className="text-white/50">Gestiona los productos y precios de tu gimnasio.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="btn-primary flex items-center gap-2"
                >
                    <span className="text-xl">+</span> Nuevo Producto
                </button>
            </div>

            <div className="glass-card !p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10 uppercase text-[10px] tracking-widest font-black text-white/40">
                        <tr>
                            <th className="px-6 py-5">Producto</th>
                            <th className="px-6 py-5">Precio</th>
                            <th className="px-6 py-5">Stock</th>
                            <th className="px-6 py-5">Estado</th>
                            <th className="px-6 py-5 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-5 font-bold">{product.name}</td>
                                <td className="px-6 py-5 font-mono text-brand-400">Q{product.price}</td>
                                <td className="px-6 py-5 text-white/60">{product.stock} unids.</td>
                                <td className="px-6 py-5">
                                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
                                        Activo
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="text-xs uppercase font-bold text-white/60 hover:text-white px-3 py-1 border border-white/10 hover:border-white/30 rounded-lg transition-all"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="text-xs uppercase font-bold text-red-400/60 hover:text-red-400 px-3 py-1 border border-red-500/10 hover:border-red-500/30 rounded-lg transition-all"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && (
                    <div className="p-20 text-center opacity-30">
                        <div className="text-xl font-bold uppercase tracking-widest">No hay productos</div>
                        <p className="text-sm">Agrega el primero para comenzar a vender.</p>
                    </div>
                )}
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                productToEdit={editingProduct}
            />
        </div>
    );
}
