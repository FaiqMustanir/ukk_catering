import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  base64Data: string,
  folder: string = "mangan"
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: folder,
      resource_type: "image",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload image");
  }
}

export async function uploadMultipleImages(
  base64DataArray: string[],
  folder: string = "mangan"
): Promise<string[]> {
  const uploadPromises = base64DataArray.map((data) =>
    uploadImage(data, folder)
  );
  return Promise.all(uploadPromises);
}

export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
}

export function getPublicIdFromUrl(url: string): string | null {
  try {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${fileName.split(".")[0]}`;
    return publicId;
  } catch {
    return null;
  }
}

export default cloudinary;
