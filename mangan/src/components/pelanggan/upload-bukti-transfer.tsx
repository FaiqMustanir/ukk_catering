"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { Modal } from "@/components/ui/modal";
import { uploadBuktiTransfer } from "@/actions/pemesanan.action";
import { Upload, CheckCircle, ImageIcon } from "lucide-react";

interface Props {
  pesananId: string;
  buktiTransfer?: string | null;
  metodePembayaran: string;
}

export function UploadBuktiTransfer({ pesananId, buktiTransfer, metodePembayaran }: Props) {
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Skip for COD
  if (metodePembayaran.toLowerCase().includes("cod")) {
    return null;
  }

  const handleUpload = () => {
    if (!imagePreview) return;

    startTransition(async () => {
      const result = await uploadBuktiTransfer(pesananId, imagePreview);
      if (result.success) {
        setMessage({ type: "success", text: "Bukti transfer berhasil diupload!" });
        setModalOpen(false);
        // Refresh page to show updated data
        window.location.reload();
      } else {
        setMessage({ type: "error", text: result.error || "Gagal upload bukti transfer" });
      }
    });
  };

  // Already uploaded
  if (buktiTransfer) {
    return (
      <>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Bukti transfer sudah diupload</span>
          </div>
          <button
            onClick={() => setViewModalOpen(true)}
            className="mt-2 text-sm text-green-600 hover:underline flex items-center gap-1"
          >
            <ImageIcon className="h-4 w-4" />
            Lihat bukti transfer
          </button>
        </div>

        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Bukti Transfer"
        >
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={buktiTransfer}
              alt="Bukti Transfer"
              className="max-h-[70vh] w-auto rounded-lg object-contain"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Tutup
            </Button>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
        <h3 className="text-lg font-semibold text-orange-800 mb-2">Konfirmasi Pembayaran</h3>
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          Mohon segera lakukan pembayaran sesuai nominal yang tertera. 
          Setelah melakukan transfer, silakan upload bukti pembayaran di sini agar pesanan Anda dapat segera kami proses.
        </p>
        <Button
          onClick={() => setModalOpen(true)}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-all hover:shadow-lg"
          size="lg"
        >
          <Upload className="mr-2 h-5 w-5" />
          Upload Bukti Transfer Sekarang
        </Button>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setImagePreview(null);
          setMessage({ type: "", text: "" });
        }}
        title="Upload Bukti Transfer"
      >
        <div className="space-y-4">
          {message.text && (
            <div
              className={`rounded-md p-3 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {message.text}
            </div>
          )}

          <ImageUpload
            value={imagePreview || ""}
            onChange={setImagePreview}
            label="Foto Bukti Transfer"
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                setImagePreview(null);
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpload}
              isLoading={isPending}
              disabled={!imagePreview}
            >
              Upload
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
