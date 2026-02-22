import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processPayment } from '@/lib/payment/processor'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // 1. Validate session
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', user.id)
            .single()

        // 2. Get product details
        const body = await request.json()
        const { productId, paymentMethod } = body

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        }

        const { data: product, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .eq('is_active', true)
            .single()

        if (productError || !product) {
            return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
        }

        // 3. Generate unique order id
        const orderId = `CGS-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

        // 4. Use unified payment processor
        const paymentResult = await processPayment(
            {
                orderId,
                grossAmount: Number(product.price),
                items: [
                    {
                        id: product.id,
                        price: Number(product.price),
                        quantity: 1,
                        name: product.title.substring(0, 50),
                    },
                ],
                customer: {
                    email: profile?.email || user.email || '',
                    firstName: profile?.full_name || 'Customer',
                },
            },
            paymentMethod,
        )

        // 5. Create order in DB
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                product_id: product.id,
                total_price: product.price,
                payment_status: paymentResult.mode === 'manual' ? 'PENDING_MANUAL' : 'PENDING',
                midtrans_order_id: orderId,
                download_count: 0,
                payment_gateway: paymentResult.gateway_name || (paymentResult.mode === 'manual' ? 'manual' : null),
            })
            .select()
            .single()

        if (orderError || !order) {
            return NextResponse.json(
                { error: `Gagal membuat order: ${orderError?.message}` },
                { status: 500 }
            )
        }

        // 6. Update Core API fields if gateway mode
        if (paymentResult.mode === 'gateway') {
            const paymentDeadline = paymentResult.expiry_time
                ? new Date(paymentResult.expiry_time).toISOString()
                : null;

            await supabase
                .from('orders')
                .update({
                    midtrans_transaction_id: paymentResult.transaction_id || null,
                    payment_code: paymentResult.payment_code || null,
                    payment_type: paymentResult.payment_type || null,
                    payment_deadline: paymentDeadline,
                })
                .eq('id', order.id)
        }

        // 7. Return result to frontend
        return NextResponse.json({
            mode: paymentResult.mode,
            gateway_name: paymentResult.gateway_name || null,
            redirect_url: paymentResult.redirect_url || null,
            manual_methods: paymentResult.manual_methods || null,
            order_id: order.id,
            midtrans_order_id: orderId,
        })
    } catch (err: unknown) {
        console.error('Checkout error:', err)
        const message = err instanceof Error ? err.message : 'Internal server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
