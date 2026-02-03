"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAllUsers, createUser, updateUser, deleteUser } from "@/actions/user.action";
import { userCreateSchema, type UserInput } from "@/lib/validations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Plus, Edit, Trash2, Search, User, Mail, Shield } from "lucide-react";
import Link from "next/link";

// Type sesuai PDM - users table hanya punya: id, name, email, password, level
type UserData = {
  id: string;
  name: string;
  email: string;
  level: string;
  createdAt: Date;
};

const levelOptions = [
  { value: "admin", label: "Admin", color: "info" as const },
  { value: "owner", label: "Owner", color: "warning" as const },
  { value: "kurir", label: "Kurir", color: "success" as const },
];

export default function AdminUserPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  const [userModal, setUserModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    data: UserData | null;
  }>({ open: false, mode: "create", data: null });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    user: UserData | null;
  }>({ open: false, user: null });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserInput>({
    resolver: zodResolver(userCreateSchema),
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers();
      if (result.success && result.data) {
        setUsers(result.data as UserData[]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openUserModal = (mode: "create" | "edit", data?: UserData) => {
    if (mode === "edit" && data) {
      reset({
        name: data.name,
        email: data.email,
        level: data.level as UserInput["level"],
        password: "", // Empty for edit mode
      });
      setUserModal({ open: true, mode: "edit", data });
    } else {
      reset({});
      setUserModal({ open: true, mode: "create", data: null });
    }
  };

  const onSubmit = (data: UserInput) => {
    startTransition(async () => {
      let result;

      if (userModal.mode === "create") {
        result = await createUser(data);
      } else {
        // For edit, only include password if it's provided
        const updateData: Partial<UserInput> = {
          name: data.name,
          email: data.email,
          level: data.level,
        };
        if (data.password) {
          updateData.password = data.password;
        }
        result = await updateUser(userModal.data!.id, updateData);
      }

      if (result.success) {
        showToast(
          `User berhasil ${userModal.mode === "create" ? "ditambahkan" : "diupdate"}`,
          "success"
        );
        fetchData();
        setUserModal({ open: false, mode: "create", data: null });
      } else {
        showToast(result.error || "Terjadi kesalahan", "error");
      }
    });
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;

    startTransition(async () => {
      const result = await deleteUser(deleteModal.user!.id);

      if (result.success) {
        showToast("User berhasil dihapus", "success");
        fetchData();
      } else {
        showToast(result.error || "Gagal menghapus user", "error");
      }
      setDeleteModal({ open: false, user: null });
    });
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = levelOptions.find((l) => l.value === level);
    return (
      <Badge variant={levelConfig?.color || "secondary"}>
        {levelConfig?.label || level}
      </Badge>
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      (user.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel ? user.level === filterLevel : true;
    return matchSearch && matchLevel;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Data Pengguna</h1>
        <div className="flex space-x-1 mt-4">
          <Link href="/admin/user" className="px-4 py-2 bg-orange-100 text-orange-800 rounded-md font-medium text-sm">Staff</Link>
          <Link href="/admin/pelanggan" className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md font-medium text-sm transition-colors">Pelanggan</Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">User Staff</h2>
          <p className="text-sm text-gray-600">Kelola admin, owner, dan kurir</p>
        </div>
        <Button onClick={() => openUserModal("create")}>
          <Plus className="mr-2 h-4 w-4" /> Tambah User
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total User</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        {levelOptions.map((level) => (
          <Card key={level.value}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{level.label}</p>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.level === level.value).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">Semua Level</option>
          {levelOptions.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </Select>
      </div>

      {/* User List */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <div className="flex items-center gap-2">
                      {getLevelBadge(user.level)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  {user.level}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openUserModal("edit", user)}
                >
                  <Edit className="mr-1 h-4 w-4" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteModal({ open: true, user })}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500">Tidak ada user ditemukan</p>
        </div>
      )}

      {/* User Modal */}
      <Modal
        isOpen={userModal.open}
        onClose={() => setUserModal({ open: false, mode: "create", data: null })}
        title={`${userModal.mode === "create" ? "Tambah" : "Edit"} User`}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama *</Label>
            <Input
              id="name"
              {...register("name")}
              error={errors.name?.message}
              placeholder="Nama lengkap"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="email@example.com"
            />
          </div>

          <div>
            <Label htmlFor="password">
              Password {userModal.mode === "create" ? "*" : "(kosongkan jika tidak diubah)"}
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              error={errors.password?.message}
              placeholder="••••••••"
            />
          </div>

          <div>
            <Label htmlFor="level">Level *</Label>
            <Select id="level" {...register("level")}>
              <option value="">Pilih level</option>
              {levelOptions.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </Select>
            {errors.level && (
              <p className="mt-1 text-sm text-red-500">{errors.level.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUserModal({ open: false, mode: "create", data: null })}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isPending}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null })}
        title="Konfirmasi Hapus"
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus user <strong>{deleteModal.user?.name}</strong>?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDeleteModal({ open: false, user: null })}
          >
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} isLoading={isPending}>
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}
