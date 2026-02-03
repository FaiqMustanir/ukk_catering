"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Shield } from "lucide-react";

export default function KurirProfilPage() {
  const { data: session } = useSession();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
      <p className="text-gray-600">Informasi akun Anda</p>

      <div className="mt-6 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <CardTitle>{session?.user?.name}</CardTitle>
                <p className="text-sm text-orange-600">Kurir</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{session?.user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="font-medium capitalize">{session?.user?.role}</p>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                <strong>Catatan:</strong> Untuk mengubah informasi profil, silakan hubungi
                administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
