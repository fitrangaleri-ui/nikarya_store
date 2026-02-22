import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/seed — One-time seeding endpoint (remove after use)
export async function POST() {
    const supabase = createAdminClient()

    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@customgaleri.com',
        password: 'Admin123!',
        email_confirm: true,
        user_metadata: { full_name: 'Admin CGS' },
    })

    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Set role to ADMIN in profiles
    if (authData.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'ADMIN', full_name: 'Admin CGS' })
            .eq('id', authData.user.id)

        if (profileError) {
            return NextResponse.json({ error: profileError.message }, { status: 400 })
        }
    }

    return NextResponse.json({
        message: 'Seed completed!',
        admin: {
            email: 'admin@customgaleri.com',
            password: 'Admin123!',
            role: 'ADMIN',
        },
    })
}
