import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { subDays, addDays } from 'date-fns';

export async function GET(req: Request) {
    return POST(req);
}

export async function POST(req: Request) {
    try {
        // 1. Create a dummy tenant
        const { data: tenant, error: tError } = await supabaseAdmin
            .from('tenants')
            .insert({
                name: 'Iron Gym Demo',
                country: 'Guatemala',
                currency_symbol: 'Q',
                currency_code: 'GTQ',
                timezone: 'America/Guatemala',
                status: 'ACTIVE'
            })
            .select()
            .single();

        if (tError) throw tError;


        // 2.5 Seed Plans
        const plansData = [
            { name: 'Mensualidad', price: 350.00, duration_days: 30 },
            { name: 'Quincena', price: 200.00, duration_days: 15 },
            { name: 'Semana', price: 125.00, duration_days: 7 },
            { name: 'Día', price: 35.00, duration_days: 1 },
            { name: 'Visita', price: 25.00, duration_days: 1 },
        ];

        for (const p of plansData) {
            await supabaseAdmin.from('plans').insert({
                tenant_id: tenant.id,
                name: p.name,
                price: p.price,
                duration_days: p.duration_days,
                active: true
            });
        }

        // 3. Create members with different due dates
        const memberData = [
            { name: 'Juan Perez', phone: '+50212345678', offset: -10 }, // Active
            { name: 'Maria Lopez', phone: '+50287654321', offset: -31 }, // Expired
            { name: 'Carlos Ruiz', phone: '+50255554444', offset: -29 }, // Expiring (due today-ish)
            { name: 'Ana Garcia', phone: '+50211112222', offset: -25 }, // Active
            { name: 'Pedro Ortiz', phone: '+50299998888', offset: -35 }, // Expired (recovery candidate)
        ];

        for (const m of memberData) {
            const { data: member, error: mError } = await supabaseAdmin
                .from('members')
                .insert({
                    tenant_id: tenant.id,
                    name: m.name,
                    phone: m.phone,
                    status: 'ACTIVE'
                })
                .select()
                .single();

            if (mError) continue;

            // Seed membership
            const startDate = addDays(new Date(), m.offset);
            const nextDue = addDays(startDate, 30);

            await supabaseAdmin.from('memberships').insert({
                member_id: member.id,
                tenant_id: tenant.id,
                plan_name: 'Plan Mensual Demo',
                amount: 350.00,
                start_date: startDate.toISOString().split('T')[0],
                next_due_date: nextDue.toISOString().split('T')[0],
                status: nextDue < new Date() ? 'EXPIRED' : 'ACTIVE'
            });
        }

        // 3. Seed Products
        const productsData = [
            { name: 'Agua Pura 600ml', price: 5.00 },
            { name: 'Gatorade 500ml', price: 12.00 },
            { name: 'Proteína Scoop', price: 15.00 },
            { name: 'Barrita Energética', price: 10.00 },
        ];

        for (const p of productsData) {
            await supabaseAdmin.from('products').insert({
                tenant_id: tenant.id,
                name: p.name,
                price: p.price,
                stock: 100,
                active: true
            });
        }

        return NextResponse.json({ success: true, tenant_id: tenant.id });
    } catch (error: any) {
        console.error('Seed Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
