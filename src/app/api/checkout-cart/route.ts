import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processPayment } from "@/lib/payment/processor";

interface CartItemInput {
  id: string;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  password?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // 1. Check auth (optional — guest checkout with registration)
    const {
      data: { user: existingUser },
    } = await supabase.auth.getUser();

    let userId: string | null = existingUser?.id || null;
    let customerName = "Customer";
    let customerEmail = "";
    let customerPhone = "";
    let isNewUser = false;

    // 2. Parse request body
    const body = await request.json();
    const { items, customerInfo, paymentMethod, manualPaymentMethodId } = body as {
      items: CartItemInput[];
      customerInfo?: CustomerInfo;
      paymentMethod?: string;
      manualPaymentMethodId?: string;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart items required" },
        { status: 400 },
      );
    }

    // 3. Resolve customer details
    if (existingUser) {
      // Logged-in user: use profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", existingUser.id)
        .single();

      customerName = profile?.full_name || "Customer";
      customerEmail = profile?.email || existingUser.email || "";
    } else {
      // Not logged in: require customerInfo
      if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
        return NextResponse.json(
          { error: "Informasi pelanggan (nama, email, HP) wajib diisi" },
          { status: 400 },
        );
      }

      customerName = customerInfo.name;
      customerEmail = customerInfo.email;
      customerPhone = customerInfo.phone;

      // If password provided, create a new Supabase Auth account
      if (customerInfo.password) {
        const { data: signUpData, error: signUpError } = await adminSupabase.auth.admin.createUser({
          email: customerInfo.email,
          password: customerInfo.password,
          user_metadata: { full_name: customerInfo.name },
          email_confirm: false, // requires email verification
        });

        if (signUpError) {
          // If email already exists, tell user to login
          if (signUpError.message?.includes("already") || signUpError.message?.includes("exists")) {
            return NextResponse.json(
              { error: "Email sudah terdaftar. Silakan login terlebih dahulu.", requireLogin: true },
              { status: 409 },
            );
          }
          console.error("Sign up error:", signUpError);
          return NextResponse.json(
            { error: `Gagal membuat akun: ${signUpError.message}` },
            { status: 400 },
          );
        }

        if (signUpData.user) {
          userId = signUpData.user.id;
          isNewUser = true;
        }
      }
    }

    // 4. Fetch all products from DB
    const productIds = items.map((item) => item.id);
    const { data: products, error: productsError } = await adminSupabase
      .from("products")
      .select("*")
      .in("id", productIds)
      .eq("is_active", true);

    if (productsError || !products || products.length === 0) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    // 5. Build a quantity map from cart items
    const quantityMap = new Map<string, number>();
    for (const item of items) {
      quantityMap.set(item.id, item.quantity);
    }

    // 6. Calculate total price
    const totalPrice = products.reduce((sum, p) => {
      const qty = quantityMap.get(p.id) || 1;
      return sum + Number(p.price) * qty;
    }, 0);

    // 7. Generate unique order id
    const orderId = `CGS-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 8. Use unified payment processor
    const paymentResult = await processPayment(
      {
        orderId,
        grossAmount: totalPrice,
        items: products.map((product) => {
          const qty = quantityMap.get(product.id) || 1;
          return {
            id: product.id,
            price: Number(product.price),
            quantity: qty,
            name: product.title.substring(0, 50),
          };
        }),
        customer: {
          email: customerEmail,
          firstName: customerName,
          phone: customerPhone || undefined,
        },
      },
      paymentMethod,
    );

    // 9. Create order rows
    const isManual = paymentResult.mode === "manual";
    const isGateway = paymentResult.mode === "gateway";

    const paymentDeadline = paymentResult.expiry_time
      ? new Date(paymentResult.expiry_time).toISOString()
      : isManual
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : null;

    const ordersToInsert = products.map((product) => {
      const qty = quantityMap.get(product.id) || 1;
      return {
        user_id: userId,
        product_id: product.id,
        total_price: Number(product.price) * qty,
        quantity: qty,
        payment_status: isManual ? "PENDING_MANUAL" : "PENDING",
        midtrans_order_id: orderId,
        download_count: 0,
        payment_method: paymentMethod || null,
        payment_gateway: paymentResult.gateway_name || (isManual ? "manual" : null),
        guest_name: existingUser ? null : customerName,
        guest_email: existingUser ? null : customerEmail,
        guest_phone: existingUser ? null : customerPhone,
        manual_payment_method_id: isManual ? (manualPaymentMethodId || null) : null,
        payment_deadline: paymentDeadline,
        midtrans_transaction_id: isGateway ? (paymentResult.transaction_id || null) : null,
        payment_code: paymentResult.payment_code || null,
        payment_type: paymentResult.payment_type || null,
      };
    });

    const { error: orderError } = await adminSupabase
      .from("orders")
      .insert(ordersToInsert);

    if (orderError) {
      console.error("Order insert error:", orderError);
      return NextResponse.json(
        { error: `Gagal membuat order: ${orderError.message}` },
        { status: 500 },
      );
    }

    // 10. Return result to frontend
    return NextResponse.json({
      mode: paymentResult.mode,
      gateway_name: paymentResult.gateway_name || null,
      redirect_url: paymentResult.redirect_url || null,
      midtrans_order_id: orderId,
      isNewUser,
    });
  } catch (err: unknown) {
    console.error("Checkout cart error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
