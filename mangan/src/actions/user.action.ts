"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { userCreateSchema, type UserCreateInput, type UserUpdateInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        level: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: users.map((u) => ({
        ...u,
        id: u.id.toString(),
      })),
    };
  } catch (error) {
    console.error("Get users error:", error);
    return { success: false, error: "Terjadi kesalahan", data: [] };
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        level: true,
        createdAt: true,
      },
    });

    if (!user) {
      return { success: false, error: "User tidak ditemukan" };
    }

    return {
      success: true,
      data: {
        ...user,
        id: user.id.toString(),
      },
    };
  } catch (error) {
    console.error("Get user error:", error);
    return { success: false, error: "Terjadi kesalahan" };
  }
}

export async function createUser(data: UserCreateInput) {
  try {
    const validated = userCreateSchema.parse(data);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 12);

    await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        level: validated.level,
      },
    });

    revalidatePath("/admin/user");
    return { success: true, message: "User berhasil ditambahkan" };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error: "Terjadi kesalahan saat membuat user" };
  }
}

export async function updateUser(id: string, data: UserUpdateInput) {
  try {
    const updateData: Record<string, unknown> = {};

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.level) updateData.level = data.level;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    await prisma.user.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    revalidatePath("/admin/user");
    return { success: true, message: "User berhasil diupdate" };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, error: "Terjadi kesalahan saat update user" };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id: BigInt(id) },
    });

    revalidatePath("/admin/user");
    return { success: true, message: "User berhasil dihapus" };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: "Terjadi kesalahan saat menghapus user" };
  }
}

export async function getKurirUsers() {
  try {
    const kurirs = await prisma.user.findMany({
      where: { level: "kurir" },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: kurirs.map((k) => ({
        ...k,
        id: k.id.toString(),
      })),
    };
  } catch (error) {
    console.error("Get kurir users error:", error);
    return { success: false, error: "Terjadi kesalahan", data: [] };
  }
}

export async function getAllPelanggan() {
  try {
    const pelanggans = await prisma.pelanggan.findMany({
      select: {
        id: true,
        namaPelanggan: true,
        email: true,
        telepon: true,
        tglLahir: true,
        alamat1: true,
        alamat2: true,
        alamat3: true,
        kartuId: true,
        foto: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: pelanggans.map((p) => ({
        ...p,
        id: p.id.toString(),
      })),
    };
  } catch (error) {
    console.error("Get pelanggan error:", error);
    return { success: false, error: "Terjadi kesalahan", data: [] };
  }
}
