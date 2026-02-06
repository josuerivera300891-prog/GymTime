import { useState, useEffect } from 'react';
import { upsertProduct, uploadProductPhoto } from '@/app/actions/products';

type Product = {
    id?: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    image_url?: string;
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
    const [stock, setStock] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        if (productToEdit) {
            setName(productToEdit.name);
            setDescription(productToEdit.description || '');
            setPrice(productToEdit.price.toString());
            setStock(productToEdit.stock.toString());
            setImageUrl(productToEdit.image_url || '');
        } else {
            setName('');
            setDescription('');
            setPrice('');
            setStock('');
            setImageUrl('');
        }
    }, [productToEdit, isOpen]);

    if (!isOpen) return null;

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || !e.target.files[0]) return;
        setUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tenantId', tenantId);

        try {
            const result = await uploadProductPhoto(formData);
            if (result.success) {
                setImageUrl(result.url!);
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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        if (productToEdit?.id) formData.append('id', productToEdit.id);
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('image_url', imageUrl);
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
                    {/* Image Upload Section */}
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 group hover:border-brand-500/50 transition-all cursor-pointer relative overflow-hidden">
                        {imageUrl ? (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-xs font-bold uppercase tracking-widest text-white">Cambiar Imagen</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-3xl mb-2">📸</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-white/40">Subir foto del producto</div>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={uploading}
                        />
                        {uploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
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
                        disabled={submitting || uploading}
                        className="w-full btn-primary mt-6 !py-4 flex justify-center items-center gap-3 font-black uppercase tracking-widest text-sm"
                    >
                        {(submitting || uploading) && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>}
                        {productToEdit ? 'Guardar Cambios' : 'Crear Producto'}
                    </button>
                </form>
            </div>
        </div>
    );
}
