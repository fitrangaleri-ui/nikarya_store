declare module 'midtrans-client' {
    interface SnapOptions {
        isProduction: boolean
        serverKey: string
        clientKey?: string
    }

    interface TransactionResult {
        token: string
        redirect_url: string
    }

    interface TransactionDetails {
        transaction_details: {
            order_id: string
            gross_amount: number
        }
        item_details?: Array<{
            id: string
            price: number
            quantity: number
            name: string
        }>
        customer_details?: {
            email?: string
            first_name?: string
            last_name?: string
            phone?: string
        }
    }

    class Snap {
        constructor(options: SnapOptions)
        createTransaction(parameter: TransactionDetails): Promise<TransactionResult>
    }

    export default { Snap }
}
