/*
  Warnings:

  - The values [UlangTahun,StudiTour] on the enum `KategoriPaket` will be removed. If these variants are still used in the database, this will fail.
  - The values [SedangDikirim,TibaDitujuan] on the enum `StatusKirim` will be removed. If these variants are still used in the database, this will fail.
  - The values [MenungguKonfirmasi,SedangDiproses,MenungguKurir] on the enum `StatusPesanan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "KategoriPaket_new" AS ENUM ('Pernikahan', 'Selamatan', 'Ulang Tahun', 'Studi Tour', 'Rapat');
ALTER TABLE "pakets" ALTER COLUMN "kategori" TYPE "KategoriPaket_new" USING ("kategori"::text::"KategoriPaket_new");
ALTER TYPE "KategoriPaket" RENAME TO "KategoriPaket_old";
ALTER TYPE "KategoriPaket_new" RENAME TO "KategoriPaket";
DROP TYPE "public"."KategoriPaket_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StatusKirim_new" AS ENUM ('Sedang Dikirim', 'Tiba Ditujuan');
ALTER TABLE "public"."pengirimans" ALTER COLUMN "status_kirim" DROP DEFAULT;
ALTER TABLE "pengirimans" ALTER COLUMN "status_kirim" TYPE "StatusKirim_new" USING ("status_kirim"::text::"StatusKirim_new");
ALTER TYPE "StatusKirim" RENAME TO "StatusKirim_old";
ALTER TYPE "StatusKirim_new" RENAME TO "StatusKirim";
DROP TYPE "public"."StatusKirim_old";
ALTER TABLE "pengirimans" ALTER COLUMN "status_kirim" SET DEFAULT 'Sedang Dikirim';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StatusPesanan_new" AS ENUM ('Menunggu Konfirmasi', 'Sedang Diproses', 'Menunggu Kurir');
ALTER TABLE "public"."pemesanans" ALTER COLUMN "status_pesan" DROP DEFAULT;
ALTER TABLE "pemesanans" ALTER COLUMN "status_pesan" TYPE "StatusPesanan_new" USING ("status_pesan"::text::"StatusPesanan_new");
ALTER TYPE "StatusPesanan" RENAME TO "StatusPesanan_old";
ALTER TYPE "StatusPesanan_new" RENAME TO "StatusPesanan";
DROP TYPE "public"."StatusPesanan_old";
ALTER TABLE "pemesanans" ALTER COLUMN "status_pesan" SET DEFAULT 'Menunggu Konfirmasi';
COMMIT;

-- AlterTable
ALTER TABLE "pemesanans" ALTER COLUMN "status_pesan" SET DEFAULT 'Menunggu Konfirmasi';

-- AlterTable
ALTER TABLE "pengirimans" ALTER COLUMN "status_kirim" SET DEFAULT 'Sedang Dikirim';
