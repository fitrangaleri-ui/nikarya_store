import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_DOWNLOADS = 25

export async function GET(
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

        // 2. Fetch order by ID (use admin client to get drive_file_url from products)
        const adminClient = createAdminClient()
        const { data: order, error: orderError } = await adminClient
            .from('orders')
            .select('*, products(drive_file_url, title)')
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

        // 6. Get drive_file_url
        const product = order.products as { drive_file_url: string | null; title: string } | null
        const driveUrl = product?.drive_file_url

        if (!driveUrl) {
            return NextResponse.json(
                { error: 'File tidak tersedia. Hubungi admin.' },
                { status: 404 }
            )
        }

        // 7. Increment download_count and record timestamp
        const newCount = currentCount + 1
        await adminClient
            .from('orders')
            .update({
                download_count: newCount,
                last_download_at: new Date().toISOString(),
            })
            .eq('id', orderId)

        // 8. Return the drive URL + metadata
        return NextResponse.json({
            url: driveUrl,
            download_count: newCount,
            remaining: MAX_DOWNLOADS - newCount,
            max: MAX_DOWNLOADS,
            product_title: product?.title || 'Produk',
        })
    } catch (err: unknown) {
        console.error('Download error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
