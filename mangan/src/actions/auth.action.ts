"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { pelangganRegisterSchema, pelangganUpdateSchema, type PelangganRegisterInput, type PelangganUpdateInput } from "@/lib/validations";
import { uploadImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function registerPelanggan(data: PelangganRegisterInput) {
  try {
    const validated = pelangganRegisterSchema.parse(data);

    // Check if email already exists
    const existingPelanggan = await prisma.pelanggan.findUnique({
      where: { email: validated.email },
    });

    if (existingPelanggan) {
      return { success: false, error: "Email sudah terdaftar" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 12);

    // Create pelanggan
    await prisma.pelanggan.create({
      data: {
        namaPelanggan: validated.namaPelanggan,
        email: validated.email,
        password: hashedPassword,
        telepon: validated.noTelepon,
        alamat1: validated.alamat,
      },
    });

    return { success: true, message: "Registrasi berhasil" };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, error: "Terjadi kesalahan saat registrasi" };
  }
}

export async function loginPelanggan(email: string, password: string) {
  try {
    const result = await signIn("pelanggan-login", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: "Email atau password salah" };
    }

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Email atau password salah" };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const result = await signIn("user-login", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: "Email atau password salah" };
    }

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Email atau password salah" };
  }
}

export async function logout() {
  await signOut({ redirect: false });
  return { success: true };
}

export async function getPelangganById(id: string) {
  try {
    const pelanggan = await prisma.pelanggan.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        namaPelanggan: true,
        email: true,
        tglLahir: true,
        telepon: true,
        alamat1: true,
        alamat2: true,
        alamat3: true,
        kartuId: true,
        foto: true,
        createdAt: true,
      },
    });

    if (!pelanggan) {
      return { success: false, error: "Pelanggan tidak ditemukan" };
    }

    return {
      success: true,
      data: {
        ...pelanggan,
        id: pelanggan.id.toString(),
      },
    };
  } catch (error) {
    console.error("Get pelanggan error:", error);
    return { success: false, error: "Terjadi kesalahan" };
  }
}

export async function updatePelanggan(
  id: string,
  data: PelangganUpdateInput,
  fotoBase64?: string,
  kartuIdBase64?: string
) {
  try {
    const validated = pelangganUpdateSchema.parse(data);
    
    let fotoUrl = validated.foto;
    let kartuIdUrl = validated.kartuId;

    // Upload foto if provided
    if (fotoBase64 && fotoBase64.startsWith("data:image")) {
      fotoUrl = await uploadImage(fotoBase64, "mangan/pelanggan/foto");
    }

    // Upload kartu ID if provided
    if (kartuIdBase64 && kartuIdBase64.startsWith("data:image")) {
      kartuIdUrl = await uploadImage(kartuIdBase64, "mangan/pelanggan/kartu");
    }

    await prisma.pelanggan.update({
      where: { id: BigInt(id) },
      data: {
        namaPelanggan: validated.namaPelanggan,
        email: validated.email,
        tglLahir: validated.tglLahir ? new Date(validated.tglLahir) : undefined,
        telepon: validated.telepon,
        alamat1: validated.alamat1,
        alamat2: validated.alamat2,
        alamat3: validated.alamat3,
        foto: fotoUrl,
        kartuId: kartuIdUrl,
      },
    });

    revalidatePath("/pelanggan/profile");
    return { success: true, message: "Profil berhasil diupdate" };
  } catch (error) {
    console.error("Update pelanggan error:", error);
    return { success: false, error: "Terjadi kesalahan saat update" };
  }
}
