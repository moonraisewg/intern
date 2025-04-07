"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import React from "react";
import dynamic from "next/dynamic";

// Nextjs hydration error fix
const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  {
    ssr: false,
    loading: () => {
      return (
        <div
          className="bg-black border border-gray-800 rounded-md animate-pulse flex items-center"
          style={{
            width: "173.47px",
            height: "48px",
            padding: "0 12px",
            gap: "8px",
          }}
        >
          <div
            className="rounded-full bg-purple-400/30"
            style={{ width: "24px", height: "24px" }}
          ></div>
          <div
            className="h-4 bg-white/10 rounded-sm"
            style={{ width: "100px" }}
          ></div>
        </div>
      );
    },
  }
);

export function WalletButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">
            <WalletMultiButton />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Devnet Only</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
