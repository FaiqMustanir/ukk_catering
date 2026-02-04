-- CreateEnum
CREATE TYPE "UserLevel" AS ENUM ('admin', 'owner', 'kurir');

-- CreateEnum
CREATE TYPE "JenisPaket" AS ENUM ('Prasmanan', 'Box');

-- CreateEnum
CREATE TYPE "KategoriPaket" AS ENUM ('Pernikahan', 'Selamatan', 'UlangTahun', 'StudiTour', 'Rapat');

-- CreateEnum
CREATE TYPE "StatusPesanan" AS ENUM ('MenungguKonfirmasi', 'SedangDiproses', 'MenungguKurir');

-- CreateEnum
CREATE TYPE "StatusKirim" AS ENUM ('SedangDikirim', 'TibaDitujuan');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "level" "UserLevel" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pelanggans" (
    "id" BIGSERIAL NOT NULL,
    "nama_pelanggan" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "tgl_lahir" DATE,
    "telepon" VARCHAR(15),
    "alamat1" VARCHAR(255),
    "alamat2" VARCHAR(255),
    "alamat3" VARCHAR(255),
    "kartu_id" VARCHAR(255),
    "foto" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pelanggans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pakets" (
    "id" BIGSERIAL NOT NULL,
    "nama_paket" VARCHAR(50) NOT NULL,
    "jenis" "JenisPaket" NOT NULL,
    "kategori" "KategoriPaket" NOT NULL,
    "jumlah_pax" INTEGER NOT NULL,
    "harga_paket" INTEGER NOT NULL,
    "deskripsi" TEXT,
    "foto1" VARCHAR(255),
    "foto2" VARCHAR(255),
    "foto3" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pakets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jenis_pembayarans" (
    "id" BIGSERIAL NOT NULL,
    "metode_pembayaran" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jenis_pembayarans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_jenis_pembayarans" (
    "id" BIGSERIAL NOT NULL,
    "id_jenis_pembayaran" BIGINT NOT NULL,
    "no_rek" VARCHAR(25) NOT NULL,
    "tempat_bayar" VARCHAR(50) NOT NULL,
    "logo" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detail_jenis_pembayarans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pemesanans" (
    "id" BIGSERIAL NOT NULL,
    "id_pelanggan" BIGINT NOT NULL,
    "id_jenis_bayar" BIGINT NOT NULL,
    "no_resi" VARCHAR(30) NOT NULL,
    "tgl_pesan" TIMESTAMP(3) NOT NULL,
    "status_pesan" "StatusPesanan" NOT NULL DEFAULT 'MenungguKonfirmasi',
    "total_bayar" BIGINT NOT NULL,
    "bukti_transfer" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pemesanans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_pemesanans" (
    "id" BIGSERIAL NOT NULL,
    "id_pemesanan" BIGINT NOT NULL,
    "id_paket" BIGINT NOT NULL,
    "subtotal" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detail_pemesanans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengirimans" (
    "id" BIGSERIAL NOT NULL,
    "id_pesan" BIGINT NOT NULL,
    "id_user" BIGINT NOT NULL,
    "tgl_kirim" TIMESTAMP(3),
    "tgl_tiba" TIMESTAMP(3),
    "status_kirim" "StatusKirim" NOT NULL DEFAULT 'SedangDikirim',
    "bukti_foto" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengirimans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pelanggans_email_key" ON "pelanggans"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pengirimans_id_pesan_key" ON "pengirimans"("id_pesan");

-- AddForeignKey
ALTER TABLE "detail_jenis_pembayarans" ADD CONSTRAINT "detail_jenis_pembayarans_id_jenis_pembayaran_fkey" FOREIGN KEY ("id_jenis_pembayaran") REFERENCES "jenis_pembayarans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pemesanans" ADD CONSTRAINT "pemesanans_id_pelanggan_fkey" FOREIGN KEY ("id_pelanggan") REFERENCES "pelanggans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pemesanans" ADD CONSTRAINT "pemesanans_id_jenis_bayar_fkey" FOREIGN KEY ("id_jenis_bayar") REFERENCES "jenis_pembayarans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_pemesanans" ADD CONSTRAINT "detail_pemesanans_id_pemesanan_fkey" FOREIGN KEY ("id_pemesanan") REFERENCES "pemesanans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_pemesanans" ADD CONSTRAINT "detail_pemesanans_id_paket_fkey" FOREIGN KEY ("id_paket") REFERENCES "pakets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengirimans" ADD CONSTRAINT "pengirimans_id_pesan_fkey" FOREIGN KEY ("id_pesan") REFERENCES "pemesanans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengirimans" ADD CONSTRAINT "pengirimans_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
