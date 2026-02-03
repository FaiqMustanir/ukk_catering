"use server";

import prisma from "@/lib/prisma";
import { jenisPembayaranSchema, detailJenisPembayaranSchema, type JenisPembayaranInput, type DetailJenisPembayaranInput } from "@/lib/validations";
import { uploadImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

// ==========================================
// JENIS PEMBAYARAN
// ==========================================

export async function getAllJenisPembayaran() {
  try {
    const jenisPembayarans = await prisma.jenisPembayaran.findMany({
      include: {
        detailJenisPembayarans: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: jenisPembayarans.map((j) => ({
        ...j,
        id: j.id.toString(),
        detailJenisPembayarans: j.detailJenisPembayarans.map((d) => ({
          ...d,
          id: d.id.toString(),
          idJenisPembayaran: d.idJenisPembayaran.toString(),
        })),
      })),
    };
  } catch (error) {
    console.error("Get jenis pembayaran error:", error);
    return { success: false, error: "Terjadi kesalahan", data: [] };
  }
}

export async function createJenisPembayaran(data: JenisPembayaranInput) {
  try {
    const validated = jenisPembayaranSchema.parse(data);

    await prisma.jenisPembayaran.create({
      data: {
        metodePembayaran: validated.metodePembayaran,
      },
    });

    revalidatePath("/admin/pembayaran");
    return { success: true, message: "Jenis pembayaran berhasil ditambahkan" };
  } catch (error) {
    console.error("Create jenis pembayaran error:", error);
    return { success: false, error: "Terjadi kesalahan saat membuat jenis pembayaran" };
  }
}

export async function updateJenisPembayaran(id: string, data: JenisPembayaranInput) {
  try {
    const validated = jenisPembayaranSchema.parse(data);

    await prisma.jenisPembayaran.update({
      where: { id: BigInt(id) },
      data: {
        metodePembayaran: validated.metodePembayaran,
      },
    });

    revalidatePath("/admin/pembayaran");
    return { success: true, message: "Jenis pembayaran berhasil diupdate" };
  } catch (error) {
    console.error("Update jenis pembayaran error:", error);
    return { success: false, error: "Terjadi kesalahan saat update jenis pembayaran" };
  }
}

export async function deleteJenisPembayaran(id: string) {
  try {
    await prisma.jenisPembayaran.delete({
      where: { id: BigInt(id) },
    });

    revalidatePath("/admin/pembayaran");
    return { success: true, message: "Jenis pembayaran berhasil dihapus" };
  } catch (error) {
    console.error("Delete jenis pembayaran error:", error);
    return { success: false, error: "Terjadi kesalahan saat menghapus jenis pembayaran" };
  }
}

// ==========================================
// DETAIL JENIS PEMBAYARAN
// ==========================================

export async function createDetailJenisPembayaran(data: DetailJenisPembayaranInput, logoBase64?: string) {
  try {
    const validated = detailJenisPembayaranSchema.parse(data);

    let logoUrl = validated.logo;

    // Upload logo if provided
    if (logoBase64 && logoBase64.startsWith("data:image")) {
      logoUrl = await uploadImage(logoBase64, "mangan/pembayaran");
    }

    await prisma.detailJenisPembayaran.create({
      data: {
        idJenisPembayaran: BigInt(validated.idJenisPembayaran),
        noRek: validated.noRek,
        tempatBayar: validated.tempatBayar,
        logo: logoUrl,
      },
    });

    revalidatePath("/admin/pembayaran");
    return { success: true, message: "Detail pembayaran berhasil ditambahkan" };
  } catch (error) {
    console.error("Create detail jenis pembayaran error:", error);
    return { success: false, error: "Terjadi kesalahan saat membuat detail pembayaran" };
  }
}

export async function updateDetailJenisPembayaran(
  id: string,
  data: Partial<DetailJenisPembayaranInput>,
  logoBase64?: string
) {
  try {
    let logoUrl = data.logo;

    // Upload logo if provided
    if (logoBase64 && logoBase64.startsWith("data:image")) {
      logoUrl = await uploadImage(logoBase64, "mangan/pembayaran");
    }

    await prisma.detailJenisPembayaran.update({
      where: { id: BigInt(id) },
      data: {
        noRek: data.noRek,
        tempatBayar: data.tempatBayar,
        logo: logoUrl,
      },
    });

    revalidatePath("/admin/pembayaran");
    return { success: true, message: "Detail pembayaran berhasil diupdate" };
  } catch (error) {
    console.error("Update detail jenis pembayaran error:", error);
    return { success: false, error: "Terjadi kesalahan saat update detail pembayaran" };
  }
}

export async function deleteDetailJenisPembayaran(id: string) {
  try {
    await prisma.detailJenisPembayaran.delete({
      where: { id: BigInt(id) },
    });

    revalidatePath("/admin/pembayaran");
    return { success: true, message: "Detail pembayaran berhasil dihapus" };
  } catch (error) {
    console.error("Delete detail jenis pembayaran error:", error);
    return { success: false, error: "Terjadi kesalahan saat menghapus detail pembayaran" };
  }
}
