import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MAX_DOWNLOADS } from '@/lib/constants'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params
        const supabase = await createClient()

        // 1. Check session (must be logged in)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Fetch order by ID
        const adminClient = createAdminClient()
        const { data: order, error: orderError } = await adminClient
            .from('orders')
            .select('*, products(title)')
            .eq('id', orderId)
            .single()

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
        }

        // 3. Validate: order.user_id == current_user
        if (order.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden — bukan order Anda' }, { status: 403 })
        }

        // 4. Validate: payment_status == 'PAID'
        if (order.payment_status !== 'PAID') {
            return NextResponse.json(
                { error: 'Pembayaran belum selesai' },
                { status: 403 }
            )
        }

        // 5. Validate: download_count < MAX_DOWNLOADS
        const currentCount = order.download_count || 0
        if (currentCount >= MAX_DOWNLOADS) {
            return NextResponse.json(
                {
                    error: `Batas download tercapai (maksimal ${MAX_DOWNLOADS}x)`,
                    download_count: currentCount,
                    remaining: 0,
                    max: MAX_DOWNLOADS,
                },
                { status: 403 }
            )
        }

        // 6. Increment download_count (dilakukan di sini agar terjamin selesai
        //    sebelum response dikembalikan — proxy /file route hanya redirect)
        const newCount = currentCount + 1
        const { data: updateData, error: updateError } = await adminClient
            .from('orders')
            .update({ download_count: newCount })
            .eq('id', orderId)
            .select('download_count')
            .single()

        if (updateError) {
            console.error('Failed to update download_count:', {
                orderId,
                currentCount,
                newCount,
                error: updateError,
                code: updateError.code,
                message: updateError.message,
                details: updateError.details,
                hint: updateError.hint,
            })
            return NextResponse.json(
                { error: 'Gagal memperbarui kuota download.', details: updateError.message },
                { status: 500 }
            )
        }

        // Gunakan nilai dari database (bukan kalkulasi lokal) untuk akurasi
        const confirmedCount = updateData?.download_count ?? newCount

        const product = order.products as { title: string } | null

        // 7. Return updated metadata (URL tidak dikembalikan — proxy /file route yang handle)
        return NextResponse.json({
            download_count: confirmedCount,
            remaining: MAX_DOWNLOADS - confirmedCount,
            max: MAX_DOWNLOADS,
            product_title: product?.title || 'Produk',
        })
    } catch (err: unknown) {
        console.error('Download error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
