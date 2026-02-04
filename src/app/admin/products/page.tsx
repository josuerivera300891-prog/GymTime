import { supabaseAdmin } from '@/lib/supabaseServer';
import ProductManagement from '@/components/admin/ProductManagement';

export default async function ProductsPage() {
    const { data: products } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name');

    return <ProductManagement products={products || []} />;
}
