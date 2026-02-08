import { useState, useEffect } from 'react';
import { upsertProduct, uploadProductPhoto } from '@/app/actions/products';

type Product = {
    id?: string;
    name: string;
    description?: string;
    price: number;
    price_usd?: number;
    stock: number;
    image_url?: string;
    images?: string[];
};

export default function ProductModal({
    isOpen,
    onClose,
    productToEdit,
    currency,
    tenantId
}: {
    isOpen: boolean;
    onClose: () => void;
    productToEdit?: Product | null;
    currency: string;
    tenantId: string;
}) {
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Default values logic
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [priceUsd, setPriceUsd] = useState('');
    const [stock, setStock] = useState('');
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        if (productToEdit) {
            setName(productToEdit.name);
            setDescription(productToEdit.description || '');
            setPrice(productToEdit.price.toString());
            setPriceUsd(productToEdit.price_usd?.toString() || '');
            setStock(productToEdit.stock.toString());
            setImages(productToEdit.images || (productToEdit.image_url ? [productToEdit.image_url] : []));
        } else {
            setName('');
            setDescription('');
            setPrice('');
            setPriceUsd('');
            setStock('');
            setImages([]);
        }
    }, [productToEdit, isOpen]);

    if (!isOpen) return null;

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || !e.target.files[0]) return;
        if (images.length >= 5) {
            alert('Máximo 5 imágenes por producto');
            return;
        }

        setUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tenantId', tenantId);

        try {
            const result = await uploadProductPhoto(formData);
            if (result.success) {
                setImages([...images, result.url!]);
            } else {
                alert('Error al subir imagen: ' + result.error);
            }
        } catch (err) {
            console.error(err);
            alert('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        if (productToEdit?.id) formData.append('id', productToEdit.id);
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('price_usd', priceUsd);
        formData.append('stock', stock);
        formData.append('images', JSON.stringify(images));
        formData.append('image_url', images[0] || ''); // Keep for legacy / main thumbnail
        formData.append('tenant_id', tenantId);

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
            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <h2 className="text-xl font-bold">{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Multi-Image Upload Section */}
                    <div className="space-y-4">
                        <label className="block text-xs uppercase tracking-widest text-white/40 font-bold">Fotos del Producto ({images.length}/5)</label>
                        <div className="grid grid-cols-3 gap-3">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            {images.length < 5 && (
                                <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-center group hover:border-brand-500/50 transition-all cursor-pointer">
                                    <div className="text-center">
                                        <div className="text-xl mb-1">📸</div>
                                        <div className="text-[10px] uppercase font-bold text-white/40">Agregar</div>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        disabled={uploading}
                                    />
                                </div>
                            )}
                        </div>
                        {uploading && (
                            <div className="flex items-center gap-3 text-xs text-brand-400 font-bold animate-pulse">
                                <div className="w-3 h-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                                Subiendo imagen...
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Nombre del Producto</label>
                        <input
                            required
                            type="text"
                            placeholder="Ej. Proteína Whey 1kg"
                            className="input-field"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Descripción</label>
                        <textarea
                            placeholder="Describe el producto, beneficios, etc."
                            className="input-field min-h-[100px] py-3"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Precio ({currency})</label>
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
                            <label className="block text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Precio (USD $)</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="input-field border-brand-500/30"
                                value={priceUsd}
                                onChange={e => setPriceUsd(e.target.value)}
                            />
                        </div>
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

                    <button
                        type="submit"
                        disabled={submitting || uploading}
                        className="w-full btn-primary mt-6 !py-4 flex justify-center items-center gap-3 font-black uppercase tracking-widest text-sm"
                    >
                        {(submitting || uploading) && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>}
                        {productToEdit ? 'Guardar Cambios' : 'Crear Producto'}
                    </button>
                </form>
            </div >
        </div >
    );
}
