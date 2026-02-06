import { supabaseAdmin } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id');

    if (!tenantId) {
        return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    try {
        const { data: products, error } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('active', true)
            .order('name');

        if (error) throw error;

        return NextResponse.json({ products });
    } catch (error: any) {
        console.error('Store API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
