'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

async function verifyAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const admin = createAdminClient()
    const { data: profile } = await admin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    if (profile?.role?.toUpperCase() !== 'ADMIN') return null
    return user
}

export async function updateOrderStatus(orderId: string, status: string) {
    const user = await verifyAdmin()
    if (!user) return { error: 'Unauthorized' }

    const admin = createAdminClient()

    const { error } = await admin
        .from('orders')
        .update({ payment_status: status })
        .eq('id', orderId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/orders')
    revalidatePath('/admin')
    return { success: true }
}
