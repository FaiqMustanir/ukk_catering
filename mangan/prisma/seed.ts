import { PrismaClient, UserLevel, JenisPaket, KategoriPaket } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Resetting database...')
  
  // Clean up existing data - Order matters for Foreign Keys
  try {
      await prisma.detailPemesanan.deleteMany()
      await prisma.pengiriman.deleteMany()
      await prisma.pemesanan.deleteMany()
  } catch (e) {
      console.log('Note: Some transaction tables were already empty or skipped.')
  }

  // Delete Core Tables
  await prisma.paket.deleteMany()
  await prisma.user.deleteMany()
  // Note: Pelanggan is usually kept, but if you want full reset, uncomment:
  // await prisma.pelanggan.deleteMany()

  console.log('Database cleared. Starting seed...')

  const passwordHash = await hash('password123', 10)

  // 1. Seed Users (Staff)
  const users = [
    {
      name: 'Admin Mangan',
      email: 'admin@mangan.id',
      password: passwordHash,
      level: UserLevel.admin,
    },
    {
      name: 'Owner Mangan',
      email: 'owner@mangan.id',
      password: passwordHash,
      level: UserLevel.owner,
    },
    {
      name: 'Kurir Mangan',
      email: 'kurir@mangan.id',
      password: passwordHash,
      level: UserLevel.kurir,
    },
  ]

  for (const user of users) {
    await prisma.user.create({
      data: user,
    })
    console.log(`Created user: ${user.name}`)
  }

  // 2. Seed Pakets (Menu) - 10 Items, Fixed Images
  const pakets = [
    {
      namaPaket: 'Paket Pernikahan Gold',
      jenis: JenisPaket.Prasmanan,
      kategori: KategoriPaket.Pernikahan,
      jumlahPax: 500,
      hargaPaket: 45000000,
      deskripsi: 'Paket lengkap prasmanan untuk 500 porsi dengan 7 menu utama + pondokan. Termasuk dekorasi area catering.',
      foto1: null,
    },
    {
      namaPaket: 'Paket Pernikahan Platinum',
      jenis: JenisPaket.Prasmanan,
      kategori: KategoriPaket.Pernikahan,
      jumlahPax: 800,
      hargaPaket: 75000000,
      deskripsi: 'Paket eksklusif untuk 800 porsi. Menu premium, live cooking, dan pelayanan VVIP.',
      foto1: null,
    },
    {
      namaPaket: 'Nasi Box Rapat Standard',
      jenis: JenisPaket.Box,
      kategori: KategoriPaket.Rapat,
      jumlahPax: 30,
      hargaPaket: 900000,
      deskripsi: 'Nasi box praktis dengan lauk ayam goreng, sayur, sambal, kerupuk, dan air mineral.',
      foto1: null,
    },
    {
      namaPaket: 'Nasi Box Rapat Premium',
      jenis: JenisPaket.Box,
      kategori: KategoriPaket.Rapat,
      jumlahPax: 50,
      hargaPaket: 1750000,
      deskripsi: 'Nasi box premium dengan pilihan lauk daging/ikan, capcay, buah potong, puding, dan air mineral.',
      foto1: null,
    },
    {
      namaPaket: 'Tumpeng Selamatan (20 Pax)',
      jenis: JenisPaket.Prasmanan,
      kategori: KategoriPaket.Selamatan,
      jumlahPax: 20,
      hargaPaket: 850000,
      deskripsi: 'Tumpeng kuning klasik dengan 7 macam lauk pauk tradisional. Cocok untuk syukuran kecil.',
      foto1: null,
    },
    {
      namaPaket: 'Tumpeng Besar (50 Pax)',
      jenis: JenisPaket.Prasmanan,
      kategori: KategoriPaket.Selamatan,
      jumlahPax: 50,
      hargaPaket: 1500000,
      deskripsi: 'Tumpeng besar hias indah dengan lauk komplit (ayam bakar, perkedel, urap, dll).',
      foto1: null,
    },
    {
      namaPaket: 'Paket Ulang Tahun Kids',
      jenis: JenisPaket.Box,
      kategori: KategoriPaket.UlangTahun,
      jumlahPax: 50,
      hargaPaket: 1250000,
      deskripsi: 'Bento box karakter lucu dengan menu sehat (nugget homemade, sayur, sosis) + susu kotak.',
      foto1: null,
    },
    {
      namaPaket: 'Prasmanan Ulang Tahun Sweet 17',
      jenis: JenisPaket.Prasmanan,
      kategori: KategoriPaket.UlangTahun,
      jumlahPax: 100,
      hargaPaket: 8000000,
      deskripsi: 'Menu prasmanan modern dengan dessert table (cupcakes, pudding) untuk pesta remaja.',
      foto1: null,
    },
    {
      namaPaket: 'Paket Studi Tour Hemat',
      jenis: JenisPaket.Box,
      kategori: KategoriPaket.StudiTour,
      jumlahPax: 200,
      hargaPaket: 4000000,
      deskripsi: 'Paket nasi box ekonomis untuk rombongan besar. Higienis, kenyang, dan praktis.',
      foto1: null,
    },
    {
      namaPaket: 'Corporate Gathering Buffet',
      jenis: JenisPaket.Prasmanan,
      kategori: KategoriPaket.Rapat,
      jumlahPax: 150,
      hargaPaket: 12000000,
      deskripsi: 'Menu prasmanan nusantara lengkap untuk acara kantor atau gathering perusahaan.',
      foto1: null,
    },
  ]

  console.log('Seeding Pakets...')
  for (const paket of pakets) {
    await prisma.paket.create({
        data: paket
    })
    console.log(`Created paket: ${paket.namaPaket}`)
  }

  console.log('Seeding complete.')
  
  console.log('\n=============================================')
  console.log('🎉 SEEDING BERHASIL! GUNAKAN AKUN BERIKUT:')
  console.log('=============================================')
  console.log('🔐 Password untuk semua akun: password123')
  console.log('---------------------------------------------')
  console.log('👤 ADMIN')
  console.log('   Email: admin@mangan.id')
  console.log('---------------------------------------------')
  console.log('👤 OWNER')
  console.log('   Email: owner@mangan.id')
  console.log('---------------------------------------------')
  console.log('👤 KURIR')
  console.log('   Email: kurir@mangan.id')
  console.log('=============================================\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
