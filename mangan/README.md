# Mangan - Catering Management System

Sistem manajemen katering berbasis web yang modern dan komprehensif, dibangun dengan Next.js 15 dan Prisma. Aplikasi ini menghubungkan Admin, Pemilik (Owner), Kurir, dan Pelanggan dalam satu platform yang terintegrasi.

## 🚀 Fitur Utama

### 👥 Multi-Role User
*   **Admin**: Mengelola paket makanan, pesanan, pembayaran, pengiriman, dan data pelanggan.
*   **Owner**: Memantau laporan penjualan dan performa bisnis.
*   **Kurir**: Dashboard khusus untuk melihat tugas pengiriman dan upload bukti pengiriman (foto).
*   **Pelanggan**: Melihat menu, melakukan pemesanan (keranjang), checkout, upload bukti transfer, dan melacak status pesanan.

### 📦 Manajemen Pesanan
*   Tracking status pesanan lengkap (Menunggu Pembayaran -> Diproses -> Dikirim -> Selesai).
*   Manajemen status pembayaran (Upload bukti transfer & Verifikasi Admin).
*   Sistem keranjang belanja.

### 🚚 Sistem Pengiriman
*   Penugasan kurir oleh Admin.
*   Upload foto bukti pengiriman oleh Kurir saat paket sampai.
*   Pelanggan dan Admin dapat melihat bukti foto pengiriman.

### 💳 Pembayaran & Administrasi
*   Metode pembayaran transfer bank (BCA, Mandiri, BNI, dll) dan E-Wallet.
*   Manajemen data pelanggan (termasuk dokumen KTP dan alamat).
*   Laporan penjualan real-time.

## 🛠️ Teknologi yang Digunakan

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
*   **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: PostgreSQL
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Authentication**: [NextAuth.js v5](https://authjs.dev/)
*   **Form Validation**: Zod & React Hook Form
*   **Icon Set**: Lucide React
*   **Image Storage**: Cloudinary (untuk foto produk, bukti transfer, kyc, dan bukti kirim)

## ⚙️ Persyaratan Sistem

Before you begin, ensure you have met the following requirements:
*   Node.js (v18.17 atau lebih baru)
*   PostgreSQL Database
*   Akun Cloudinary (untuk upload gambar)

## 📥 Cara Instalasi & Menjalankan Project

1.  **Clone Repository**
    ```bash
    git clone https://github.com/username/mangan.git
    cd mangan
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment Variables**
    Buat file `.env` di root folder dan isi konfigurasi berikut:
    ```env
    # Database Configuration
    DATABASE_URL="postgresql://user:password@localhost:5432/mangan_db?schema=public"

    # NextAuth Configuration
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your-super-secret-key-change-this"

    # Cloudinary Configuration
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
    CLOUDINARY_API_KEY="your_api_key"
    CLOUDINARY_API_SECRET="your_api_secret"
    ```

4.  **Setup Database**
    Generate Client Prisma dan push schema ke database:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Seeding Data (Data Awal)**
    Isi database dengan data awal (User Admin, Owner, Kurir, dan Metode Pembayaran):
    ```bash
    npx prisma db seed
    ```

6.  **Jalankan Server Development**
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 🔑 Akun Default (dari Seeding)

Setelah menjalankan `npx prisma db seed`, akun-akun berikut akan tersedia:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@mangan.id` | `password123` |
| **Owner** | `owner@mangan.id` | `password123` |
| **Kurir** | `kurir@mangan.id` | `password123` |

> **Catatan**: Untuk login sebagai Pelanggan, silakan registrasi akun baru melalui halaman Register.

## 📱 Struktur Project

```
mangan/
├── prisma/               # Schema database & seed script
│   ├── schema.prisma
│   └── seed.ts
├── public/               # File statis
├── src/
│   ├── actions/          # Server Actions (Backend Logic)
│   ├── app/              # Halaman Aplikasi (App Router)
│   │   ├── admin/        # Dashboard Admin
│   │   ├── kurir/        # Dashboard Kurir
│   │   ├── owner/        # Dashboard Owner
│   │   ├── pelanggan/    # Area Pelanggan
│   │   └── ...
│   ├── components/       # Komponen UI Reusable
│   ├── lib/              # Utility functions & configs
│   └── types/            # TypeScript Type Definitions
└── ...
```

## 🚀 Deployment

Untuk men-deploy ke Vercel atau hosting lainnya:

1.  Pastikan environment variables sudah di-set di platform hosting.
2.  Jalankan perintah build:
    ```bash
    npm run build
    ```
3.  Start server:
    ```bash
    npm start
    ```
