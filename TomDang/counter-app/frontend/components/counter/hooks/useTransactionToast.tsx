"use client";

import { useEffect, useRef } from "react";

import React from "react";
import { ToastContent } from "../ToastContent";
import { toast } from "sonner";

interface UseTransactionToastProps {
  transactionSignature: string | null;
}

/**
 * A hook that displays a toast when a transaction signature is available.
 */
export function useTransactionToast({
  transactionSignature,
}: UseTransactionToastProps) {
  const toastIdRef = useRef<string | number | null>(null);

  // Display toast when transaction signature is available
  useEffect(() => {
    if (transactionSignature) {
      const explorerUrl = `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`;

      // Dismiss previous toast if exists
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }

      // Create toast with custom component that manages its own state
      toastIdRef.current = toast.success("Transaction Sent!", {
        description: (
          <ToastContent
            transactionSignature={transactionSignature}
            explorerUrl={explorerUrl}
          />
        ),
        style: {
          backgroundColor: "#1f1f23",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
        },
        duration: 8000,
      });
    }
  }, [transactionSignature]);
}
