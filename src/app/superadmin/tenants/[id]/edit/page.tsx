import { supabaseAdmin } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';
import EditTenantForm from '@/components/admin/EditTenantForm';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditTenantPage({ params }: PageProps) {
    const { id } = await params;

    const { data: tenant, error } = await supabaseAdmin
        .from('tenants')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !tenant) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Editar Gimnasio</h1>
                <p className="text-white/50 text-sm">Modifica los datos del gimnasio seleccionado.</p>
            </div>

            <EditTenantForm tenant={tenant} />
        </div>
    );
}
