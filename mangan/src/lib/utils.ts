import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency to IDR
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date to Indonesian format
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// Format date with time
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

// Get status label
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    MenungguKonfirmasi: "Menunggu Konfirmasi",
    SedangDiproses: "Sedang Diproses",
    MenungguKurir: "Menunggu Kurir",
    SedangDikirim: "Sedang Dikirim",
    TibaDitujuan: "Tiba di Tujuan",
    Selesai: "Selesai",
  };
  return labels[status] || status;
}

// Get status badge color
export function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    MenungguKonfirmasi: "bg-yellow-100 text-yellow-800",
    SedangDiproses: "bg-blue-100 text-blue-800",
    MenungguKurir: "bg-purple-100 text-purple-800",
    SedangDikirim: "bg-indigo-100 text-indigo-800",
    TibaDitujuan: "bg-green-100 text-green-800",
    Selesai: "bg-green-100 text-green-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

// Get kategori label
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

// Generate No Resi
export function generateNoResi(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `MNG${year}${month}${day}${random}`;
}
