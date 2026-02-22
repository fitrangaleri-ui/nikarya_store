import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const {
            order_id,
            status_code,
            gross_amount,
            signature_key,
            transaction_status,
            fraud_status,
        } = body

        // 1. Get server key from DB config (not env vars)
        const supabase = createAdminClient()

        const { data: config } = await supabase
            .from('payment_gateway_config')
            .select('secret_key')
            .eq('gateway_name', 'midtrans')
            .limit(1)
            .maybeSingle()

        const serverKey = config?.secret_key || process.env.MIDTRANS_SERVER_KEY || ''

        // 2. Verify signature (SHA512: order_id + status_code + gross_amount + server_key)
        const expectedSignature = crypto
            .createHash('sha512')
            .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
            .digest('hex')

        if (signature_key !== expectedSignature) {
            console.error('Midtrans webhook: invalid signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
        }

        // 3. Determine payment status
        let paymentStatus: string = 'PENDING'

        if (transaction_status === 'capture') {
            paymentStatus = fraud_status === 'accept' ? 'PAID' : 'FAILED'
        } else if (transaction_status === 'settlement') {
            paymentStatus = 'PAID'
        } else if (
            transaction_status === 'deny' ||
            transaction_status === 'cancel'
        ) {
            paymentStatus = 'FAILED'
        } else if (transaction_status === 'expire') {
            paymentStatus = 'EXPIRED'
        } else if (transaction_status === 'pending') {
            paymentStatus = 'PENDING'
        }

        // 4. Update order in DB
        const updateData: Record<string, unknown> = { payment_status: paymentStatus };

        // Set confirmation timestamp and transaction ID on successful payment
        if (paymentStatus === 'PAID') {
            updateData.payment_confirmed_at = new Date().toISOString();
            if (body.transaction_id) {
                updateData.midtrans_transaction_id = body.transaction_id;
            }
        }

        const { error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('midtrans_order_id', order_id)

        if (error) {
            console.error('Midtrans webhook: update failed', error)
            return NextResponse.json({ error: 'Update failed' }, { status: 500 })
        }

        console.log(`Midtrans webhook: order ${order_id} → ${paymentStatus}`)

        return NextResponse.json({ status: 'ok' })
    } catch (err: unknown) {
        console.error('Midtrans webhook error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
