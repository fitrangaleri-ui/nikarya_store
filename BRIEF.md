# FINAL PROJECT BRIEF: Nikarya Store
**Zero Cost Digital Product Store**

## A. CORE CONCEPT

**Nikarya Store** adalah website toko online untuk menjual produk digital secara satuan dengan biaya operasional Rp 0.

**Business Model:**
- Penjualan produk digital satuan.
- File produk disimpan di Google Drive (Secure Link).
- Validasi sistem sebelum download (Payment & Limit Check).

**Tech Stack (Zero Cost):**
- **Frontend:** Next.js 15 (App Router)
- **Database:** Supabase PostgreSQL (Free Tier)
- **Auth:** Supabase Auth (Email & Password)
- **Image Storage:** Supabase Storage (Free Tier) - Bucket: `product-images`
- **File Storage:** Google Drive (Manual Shared Link)
- **Payment Gateway:** Midtrans Snap (Sandbox Mode)
- **Hosting:** Vercel (Free Hobby Plan)

---

## B. GLOBAL USER FLOW

1.  **Discovery:** User membuka website -> Melihat daftar produk -> Masuk halaman detail.
2.  **Purchase Intent:** User klik "Buy Now".
3.  **Authentication:**
    - Jika Guest: Redirect ke Login/Register.
    - Jika Logged-in: Redirect kembali ke Checkout.
4.  **Checkout & Payment:**
    - User melihat ringkasan order.
    - Melakukan pembayaran via Popup Midtrans Snap.
5.  **Payment Verification:**
    - Webhook Midtrans menerima callback sukses.
    - Server mengupdate status order menjadi `PAID`.
6.  **Fulfillment:**
    - Produk muncul di Dashboard User > Tab Download.
7.  **Access:**
    - User klik Download.
    - Server memvalidasi (Auth + Payment Status + Download Count < 5).
    - Redirect ke file asli di Google Drive.

---

## C. PAGE STRUCTURE

### 1. Homepage (`/`)
- **Hero Section:** Headline, Subheadline, CTA "Explore Products".
- **Featured Products:** Grid produk unggulan.
- **How It Works:** Langkah mudah (Browse -> Pay -> Download).
- **Footer:** Copyright & Links.

### 2. Products (`/products`)
- Grid semua produk dengan filter (Kategori & Sort).
- Card Produk: Thumbnail, Title, Price, Category.

### 3. Product Detail (`/products/[slug]`)
- Detail lengkap: Image, Title, Price, Description, Buy Button.

### 4. Auth Pages
- **Login (`/login`):** Email, Password, Link ke Register & Forgot Password.
- **Register (`/register`):** Email, Password, Confirm Password. Auto-login setelah sukses.

### 5. Checkout (`/checkout`)
- **Summary:** Menampilkan produk yang akan dibeli & Total Harga.
- **Action:** Tombol "Pay Now" memicu `snap.pay(token)`.
- **Logic:** Request token ke `/api/checkout` sebelum render Snap.

### 6. User Dashboard (`/dashboard`)
*Protected Route (Middleware)*
- **Overview:** Ringkasan akun.
- **Download Tab:** List produk status `PAID`.
    - Menampilkan sisa kuota download (Max 5x).
    - Tombol Download mengarah ke API `/api/download/[orderId]`.
- **Order History:** Riwayat transaksi lengkap.

### 7. Admin Dashboard (`/admin`)
*Protected Route (Middleware + Role Check)*
- **Manage Products (CRUD):**
    - **List:** Tabel produk dengan kolom (Image, Title, Price, Category, Actions: Edit/Delete).
    - **Create/Edit Form:** 
        - Input Text: Title, Slug (auto-generate), Description.
        - Input Number: Price.
        - Input File: Upload Thumbnail ke Supabase Storage.
        - Input Text: Google Drive Link (Paste manual link file di sini).
        - Toggle: Is Active.
- **Manage Orders:** Tabel list order user dengan status pembayarannya.


## D. DATABASE STRUCTURE (Supabase)

### 1. `profiles`
| Column | Type | Note |
| :--- | :--- | :--- |
| `id` | uuid | PK, FK to `auth.users.id` |
| `email` | text | |
| `full_name` | text | |
| `role` | text | Default 'USER', enum: 'USER', 'ADMIN' |
| `created_at` | timestamp | |

### 2. `categories`
| Column | Type | Note |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `name` | text | |
| `slug` | text | Unique |

### 3. `products`
| Column | Type | Note |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `title` | text | |
| `slug` | text | Unique |
| `description` | text | |
| `price` | numeric | |
| `category_id` | uuid | FK to `categories.id` |
| `thumbnail_url` | text | Supabase Storage URL |
| `drive_file_url` | text | **SECURE**: Google Drive Link (Hidden from public) |
| `is_active` | boolean | Default true |

### 4. `orders`
| Column | Type | Note |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `user_id` | uuid | FK to `profiles.id` |
| `product_id` | uuid | FK to `products.id` |
| `total_price` | numeric | |
| `payment_status`| text | Enum: 'PENDING', 'PAID', 'FAILED' |
| `snap_token` | text | Midtrans Token |
| `midtrans_order_id`| text | Unique ID for Midtrans |
| `download_count`| integer | Default 0, Max 5 |
| `created_at` | timestamp | |

---

## E. SECURITY & PERMISSIONS

### 1. Row Level Security (RLS)
- **Profiles:** User view own; Admin view all.
- **Products:** Public view active; Admin manage all.
- **Orders:** User view own; Admin view all.

### 2. Secure Download Logic
Endpoint `/api/download/[orderId]` logic:
1.  Check Session (Must be logged in).
2.  Fetch Order by ID.
3.  Validate: `order.user_id == current_user`.
4.  Validate: `payment_status == 'PAID'`.
5.  Validate: `download_count < 5`.
6.  Action: Increment count & Redirect to `drive_file_url`.

### 3. Middleware Protection
- File `middleware.ts` untuk memvalidasi session Supabase.
- Protect routes `/dashboard/*` untuk authenticated users.
- Protect routes `/admin/*` untuk users dengan `role === 'ADMIN'`.

---

## F. INTEGRATION DETAILS

### 1. Midtrans Payment
- **Library:** `midtrans-client`
- **Flow:**
    - Create Transaction -> Get `snap_token`.
    - Frontend renders Snap Popup.
    - User pays.
    - Midtrans sends HTTP POST to `/api/webhook/midtrans`.
    - Server verifies signature & updates `orders.payment_status`.

### 2. Environment Variables
Required keys for setup:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Server-side only)
- `MIDTRANS_SERVER_KEY`
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
- `NEXT_PUBLIC_MIDTRANS_API_URL` (Sandbox URL)

---

## G. IMPLEMENTATION STRATEGY
1.  **Setup Database:** Execute SQL for Schema & RLS via MCP.
2.  **Scaffold App:** Setup Next.js + Tailwind + Shadcn/UI.
3.  **Auth Module:** Implement Login/Register with Supabase SSR.
4.  **Product Module:** Create Public Listing & Detail pages.
5.  **Payment Module:** Integrate Midtrans Token & Webhook.
6.  **Dashboard Module:** Build User Dashboard & Download logic.
7.  **Admin Module:** Build Product Management (Simple CRUD).
