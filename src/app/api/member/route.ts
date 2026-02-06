import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    console.log('[API /api/member] Received request with token:', token);

    if (!token) {
        console.log('[API /api/member] No token provided');
        return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    try {
        console.log('[API /api/member] Querying members table with auth_token:', token);

        // Use supabaseAdmin to bypass RLS and fetch member data by auth_token
        const { data: member, error } = await supabaseAdmin
            .from('members')
            .select(`
                *,
                memberships(*),
                tenants(name, country, currency_symbol, logo_url, primary_color),
                attendance(*)
            `)
            .eq('auth_token', token)
            .single();

        console.log('[API /api/member] Query result:', { member: member ? 'found' : 'null', error });

        if (error) {
            console.error('[API /api/member] Error fetching member:', error);
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        if (!member) {
            console.log('[API /api/member] No member found with token:', token);
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        // Fetch payments separately for the member's memberships
        if (member.memberships && member.memberships.length > 0) {
            const membershipIds = member.memberships.map((m: any) => m.id);
            const { data: payments } = await supabaseAdmin
                .from('payments')
                .select('*')
                .in('membership_id', membershipIds)
                .order('paid_at', { ascending: false });

            // Attach payments to their respective memberships
            member.memberships = member.memberships.map((membership: any) => ({
                ...membership,
                payments: payments?.filter((p: any) => p.membership_id === membership.id) || []
            }));
        }

        console.log('[API /api/member] Successfully found member:', member.name);
        return NextResponse.json({ member });
    } catch (error) {
        console.error('[API /api/member] API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
