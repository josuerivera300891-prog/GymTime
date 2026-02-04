'use client';

import { useState, useEffect } from 'react';
import { upsertProduct } from '@/app/actions/products';

type Product = {
    id?: string;
    name: string;
    price: number;
    stock: number;
};

export default function ProductModal({
    isOpen,
    onClose,
    productToEdit
}: {
    isOpen: boolean;
    onClose: () => void;
    productToEdit?: Product | null;
}) {
    const [submitting, setSubmitting] = useState(false);

    // Default values logic
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');

    useEffect(() => {
        if (productToEdit) {
            setName(productToEdit.name);
            setPrice(productToEdit.price.toString());
            setStock(productToEdit.stock.toString());
        } else {
            setName('');
            setPrice('');
            setStock('');
        }
    }, [productToEdit, isOpen]);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        if (productToEdit?.id) formData.append('id', productToEdit.id);
        formData.append('name', name);
        formData.append('price', price);
        formData.append('stock', stock);

        const result = await upsertProduct(formData);

        if (result.success) {
            onClose();
        } else {
            alert(result.error);
        }
        setSubmitting(false);
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <h2 className="text-xl font-bold">{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Nombre del Producto</label>
                        <input
                            required
                            type="text"
                            placeholder="Ej. Agua Pura 600ml"
                            className="input-field"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Precio (Q)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="input-field"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Stock Inicial</label>
                            <input
                                required
                                type="number"
                                placeholder="0"
                                className="input-field"
                                value={stock}
                                onChange={e => setStock(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full btn-primary mt-6 !py-3 flex justify-center items-center gap-2"
                    >
                        {submitting && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>}
                        {productToEdit ? 'Guardar Cambios' : 'Crear Producto'}
                    </button>
                </form>
            </div>
        </div>
    );
}
