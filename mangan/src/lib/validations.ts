import { z } from "zod";

// ==========================================
// USER SCHEMAS
// ==========================================
export const userLoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const userCreateSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(30, "Nama maksimal 30 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  level: z.enum(["admin", "owner", "kurir"], {
    message: "Level harus dipilih",
  }),
});

export const userSchema = userCreateSchema;

export const userUpdateSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(30, "Nama maksimal 30 karakter").optional(),
  email: z.string().email("Email tidak valid").optional(),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  level: z.enum(["admin", "owner", "kurir"]).optional(),
});

// ==========================================
// PELANGGAN SCHEMAS
// ==========================================
export const pelangganRegisterSchema = z.object({
  namaPelanggan: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Email tidak valid"),
  noTelepon: z.string().min(10, "Nomor telepon minimal 10 karakter").max(15, "Nomor telepon maksimal 15 karakter"),
  alamat: z.string().min(10, "Alamat minimal 10 karakter").max(255, "Alamat maksimal 255 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export const pelangganLoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const pelangganUpdateSchema = z.object({
  namaPelanggan: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter").optional(),
  email: z.string().email("Email tidak valid").optional(),
  tglLahir: z.string().optional(),
  telepon: z.string().max(15, "Telepon maksimal 15 karakter").optional(),
  alamat1: z.string().max(255, "Alamat maksimal 255 karakter").optional(),
  alamat2: z.string().max(255, "Alamat maksimal 255 karakter").optional(),
  alamat3: z.string().max(255, "Alamat maksimal 255 karakter").optional(),
  kartuId: z.string().optional(),
  foto: z.string().optional(),
});

// ==========================================
// PAKET SCHEMAS
// ==========================================
export const paketSchema = z.object({
  namaPaket: z.string().min(2, "Nama paket minimal 2 karakter").max(50, "Nama paket maksimal 50 karakter"),
  jenis: z.enum(["Prasmanan", "Box"], {
    message: "Jenis paket harus dipilih",
  }),
  kategori: z.enum(["Pernikahan", "Selamatan", "UlangTahun", "StudiTour", "Rapat"], {
    message: "Kategori harus dipilih",
  }),
  jumlahPax: z.number().min(1, "Jumlah pax minimal 1"),
  hargaPaket: z.number().min(1000, "Harga minimal Rp 1.000"),
  deskripsi: z.string().optional(),
  foto1: z.string().optional(),
  foto2: z.string().optional(),
  foto3: z.string().optional(),
});

export const paketUpdateSchema = paketSchema.partial();

// ==========================================
// JENIS PEMBAYARAN SCHEMAS
// ==========================================
export const jenisPembayaranSchema = z.object({
  metodePembayaran: z.string().min(2, "Metode pembayaran minimal 2 karakter").max(30, "Metode pembayaran maksimal 30 karakter"),
});

export const detailJenisPembayaranSchema = z.object({
  idJenisPembayaran: z.string().or(z.number()),
  noRek: z.string().min(5, "Nomor rekening minimal 5 karakter").max(25, "Nomor rekening maksimal 25 karakter"),
  tempatBayar: z.string().min(2, "Nama bank/platform minimal 2 karakter").max(50, "Nama bank/platform maksimal 50 karakter"),
  logo: z.string().optional(),
});

// ==========================================
// PEMESANAN SCHEMAS
// ==========================================
export const pemesananSchema = z.object({
  idJenisBayar: z.string().or(z.number()),
  alamatPengiriman: z.string().min(10, "Alamat pengiriman minimal 10 karakter"),
  items: z.array(z.object({
    idPaket: z.string().or(z.number()),
    subtotal: z.number(),
  })).min(1, "Minimal 1 item pesanan"),
});

export const pemesananStatusUpdateSchema = z.object({
  statusPesan: z.enum(["MenungguKonfirmasi", "SedangDiproses", "MenungguKurir", "Selesai", "Dibatalkan"]),
});

// ==========================================
// PENGIRIMAN SCHEMAS
// ==========================================
export const pengirimanCreateSchema = z.object({
  idPesan: z.string().or(z.number()),
  idUser: z.string().or(z.number()),
});

export const pengirimanUpdateSchema = z.object({
  statusKirim: z.enum(["SedangDikirim", "TibaDitujuan"]),
  tglKirim: z.string().optional(),
  tglTiba: z.string().optional(),
  buktiFoto: z.string().optional(),
});

// ==========================================
// TYPE EXPORTS
// ==========================================
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserInput = UserCreateInput;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type PelangganRegisterInput = z.infer<typeof pelangganRegisterSchema>;
export type PelangganLoginInput = z.infer<typeof pelangganLoginSchema>;
export type PelangganUpdateInput = z.infer<typeof pelangganUpdateSchema>;
export type PaketInput = z.infer<typeof paketSchema>;
export type PaketUpdateInput = z.infer<typeof paketUpdateSchema>;
export type JenisPembayaranInput = z.infer<typeof jenisPembayaranSchema>;
export type DetailJenisPembayaranInput = z.infer<typeof detailJenisPembayaranSchema>;
export type PemesananInput = z.infer<typeof pemesananSchema>;
export type PemesananStatusUpdateInput = z.infer<typeof pemesananStatusUpdateSchema>;
export type PengirimanCreateInput = z.infer<typeof pengirimanCreateSchema>;
export type PengirimanUpdateInput = z.infer<typeof pengirimanUpdateSchema>;
