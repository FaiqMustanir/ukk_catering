import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function generateNoResi(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MNG-${timestamp}-${random}`;
}

export function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    MenungguKonfirmasi: "bg-yellow-100 text-yellow-800",
    SedangDiproses: "bg-blue-100 text-blue-800",
    MenungguKurir: "bg-purple-100 text-purple-800",
    Selesai: "bg-green-100 text-green-800",
    Dibatalkan: "bg-red-100 text-red-800",
    SedangDikirim: "bg-blue-100 text-blue-800",
    TibaDitujuan: "bg-green-100 text-green-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    MenungguKonfirmasi: "Menunggu Konfirmasi",
    SedangDiproses: "Sedang Diproses",
    MenungguKurir: "Menunggu Kurir",
    Selesai: "Selesai",
    Dibatalkan: "Dibatalkan",
    SedangDikirim: "Sedang Dikirim",
    TibaDitujuan: "Tiba di Tujuan",
  };
  return labels[status] || status;
}

export function getKategoriLabel(kategori: string): string {
  const labels: Record<string, string> = {
    Pernikahan: "Pernikahan",
    Selamatan: "Selamatan",
    UlangTahun: "Ulang Tahun",
    StudiTour: "Studi Tour",
    Rapat: "Rapat",
  };
  return labels[kategori] || kategori;
}
