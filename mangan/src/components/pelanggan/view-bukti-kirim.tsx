"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface Props {
  imageUrl: string | null;
}

export function ViewBuktiKirim({ imageUrl }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (!imageUrl) return null;

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="w-full mt-2"
      >
        <ImageIcon className="mr-2 h-4 w-4" />
        Lihat Bukti Foto
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Bukti Foto Pengiriman"
      >
        <div className="flex justify-center">
          <Image
            src={imageUrl}
            alt="Bukti Foto"
            width={400}
            height={500}
            className="max-h-[70vh] w-auto rounded-lg object-contain"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setIsOpen(false)}>
            Tutup
          </Button>
        </div>
      </Modal>
    </>
  );
}
