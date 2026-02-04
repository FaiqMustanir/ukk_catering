"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deletePemesanan } from "@/actions/pemesanan.action";
import { toast } from "sonner";

interface DeleteOrderButtonProps {
  orderId: string;
  status: string;
  hasBuktiTransfer: boolean;
}

export function DeleteOrderButton({ orderId, status, hasBuktiTransfer }: DeleteOrderButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  // Only show if MenungguKonfirmasi AND no bukti transfer
  if (status !== "MenungguKonfirmasi" || hasBuktiTransfer) {
    return null;
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePemesanan(orderId);
      if (result.success) {
        toast.success("Pesanan berhasil dibatalkan");
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Batalkan
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Batalkan Pesanan?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini akan menghapus pesanan Anda secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Tidak</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? "Membatalkan..." : "Ya, Batalkan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
