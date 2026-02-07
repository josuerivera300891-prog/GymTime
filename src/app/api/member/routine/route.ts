import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { member_id, tenant_id, date, routine_type, sets, reps, weight, duration_minutes, notes } = body;

        if (!member_id || !tenant_id || !date || !routine_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Use upsert to create or update based on (member_id, date) which has a UNIQUE constraint
        const { data, error } = await supabaseAdmin
            .from('member_routines')
            .upsert({
                member_id,
                tenant_id,
                date,
                routine_type,
                sets: sets || null,
                reps: reps || null,
                weight: weight || null,
                duration_minutes: duration_minutes || null,
                notes: notes || '',
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'member_id,date'
            })
            .select()
            .single();

        if (error) {
            console.error('[API /api/member/routine] Error upserting routine:', error);
            return NextResponse.json({ error: 'Error saving routine' }, { status: 500 });
        }

        return NextResponse.json({ success: true, routine: data });
    } catch (error) {
        console.error('[API /api/member/routine] Internal Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
