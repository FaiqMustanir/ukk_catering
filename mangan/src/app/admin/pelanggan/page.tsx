"use client";

import { useEffect, useState } from "react";
import { getAllPelanggan } from "@/actions/user.action";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Search, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";

type Pelanggan = {
  id: string;
  namaPelanggan: string;
  email: string;
  telepon: string | null;
  alamat1: string | null;
  createdAt: Date;
};

export default function AdminPelangganPage() {
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAllPelanggan();
      if (result.success && result.data) {
        setPelanggan(result.data as Pelanggan[]);
      }
    } catch (error) {
      console.error("Error fetching pelanggan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPelanggan = pelanggan.filter(
    (p) =>
      p.namaPelanggan.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.telepon || "").includes(search)
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Data Pelanggan</h1>
        <p className="text-sm text-gray-600 mt-1">Kelola data customer yang terdaftar</p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-1">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Pelanggan</p>
            <p className="text-2xl font-bold">{pelanggan.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari nama, email, atau no hp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Pelanggan List */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredPelanggan.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{p.namaPelanggan}</h3>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      {p.email}
                    </div>
                    {p.telepon && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {p.telepon}
                    </div>
                    )}
                    {p.alamat1 && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-2">{p.alamat1}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(new Date(p.createdAt))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPelanggan.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500">Tidak ada pelanggan ditemukan</p>
        </div>
      )}
    </div>
  );
}
