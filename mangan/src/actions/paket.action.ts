"use server";

import prisma from "@/lib/prisma";
import { paketSchema, type PaketInput } from "@/lib/validations";
import { uploadImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function getAllPakets(filters?: {
  jenis?: string;
  kategori?: string;
  search?: string;
}) {
  try {
    const where: Record<string, unknown> = {};

    if (filters?.jenis) {
      where.jenis = filters.jenis;
    }

    if (filters?.kategori) {
      where.kategori = filters.kategori;
    }

    if (filters?.search) {
      where.namaPaket = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    const pakets = await prisma.paket.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: pakets.map((p) => ({
        ...p,
        id: p.id.toString(),
      })),
    };
  } catch (error) {
    console.error("Get pakets error:", error);
    return { success: false, error: "Terjadi kesalahan", data: [] };
  }
}

export async function getPaketById(id: string) {
  try {
    const paket = await prisma.paket.findUnique({
      where: { id: BigInt(id) },
    });

    if (!paket) {
      return { success: false, error: "Paket tidak ditemukan" };
    }

    return {
      success: true,
      data: {
        ...paket,
        id: paket.id.toString(),
      },
    };
  } catch (error) {
    console.error("Get paket error:", error);
    return { success: false, error: "Terjadi kesalahan" };
  }
}

export async function createPaket(
  data: PaketInput,
  foto1Base64?: string,
  foto2Base64?: string,
  foto3Base64?: string
) {
  try {
    const validated = paketSchema.parse(data);

    let foto1Url = validated.foto1;
    let foto2Url = validated.foto2;
    let foto3Url = validated.foto3;

    // Upload images to Cloudinary
    if (foto1Base64 && foto1Base64.startsWith("data:image")) {
      foto1Url = await uploadImage(foto1Base64, "mangan/paket");
    }
    if (foto2Base64 && foto2Base64.startsWith("data:image")) {
      foto2Url = await uploadImage(foto2Base64, "mangan/paket");
    }
    if (foto3Base64 && foto3Base64.startsWith("data:image")) {
      foto3Url = await uploadImage(foto3Base64, "mangan/paket");
    }

    await prisma.paket.create({
      data: {
        namaPaket: validated.namaPaket,
        jenis: validated.jenis,
        kategori: validated.kategori,
        jumlahPax: validated.jumlahPax,
        hargaPaket: validated.hargaPaket,
        deskripsi: validated.deskripsi,
        foto1: foto1Url,
        foto2: foto2Url,
        foto3: foto3Url,
      },
    });

    revalidatePath("/admin/paket");
    revalidatePath("/menu");
    return { success: true, message: "Paket berhasil ditambahkan" };
  } catch (error) {
    console.error("Create paket error:", error);
    return { success: false, error: "Terjadi kesalahan saat membuat paket" };
  }
}

export async function updatePaket(
  id: string,
  data: Partial<PaketInput>,
  foto1Base64?: string,
  foto2Base64?: string,
  foto3Base64?: string
) {
  try {
    let foto1Url = data.foto1;
    let foto2Url = data.foto2;
    let foto3Url = data.foto3;

    // Upload new images to Cloudinary
    if (foto1Base64 && foto1Base64.startsWith("data:image")) {
      foto1Url = await uploadImage(foto1Base64, "mangan/paket");
    }
    if (foto2Base64 && foto2Base64.startsWith("data:image")) {
      foto2Url = await uploadImage(foto2Base64, "mangan/paket");
    }
    if (foto3Base64 && foto3Base64.startsWith("data:image")) {
      foto3Url = await uploadImage(foto3Base64, "mangan/paket");
    }

    await prisma.paket.update({
      where: { id: BigInt(id) },
      data: {
        namaPaket: data.namaPaket,
        jenis: data.jenis,
        kategori: data.kategori,
        jumlahPax: data.jumlahPax,
        hargaPaket: data.hargaPaket,
        deskripsi: data.deskripsi,
        foto1: foto1Url,
        foto2: foto2Url,
        foto3: foto3Url,
      },
    });

    revalidatePath("/admin/paket");
    revalidatePath("/menu");
    return { success: true, message: "Paket berhasil diupdate" };
  } catch (error) {
    console.error("Update paket error:", error);
    return { success: false, error: "Terjadi kesalahan saat update paket" };
  }
}

export async function deletePaket(id: string) {
  try {
    await prisma.paket.delete({
      where: { id: BigInt(id) },
    });

    revalidatePath("/admin/paket");
    revalidatePath("/menu");
    return { success: true, message: "Paket berhasil dihapus" };
  } catch (error) {
    console.error("Delete paket error:", error);
    return { success: false, error: "Terjadi kesalahan saat menghapus paket" };
  }
}
