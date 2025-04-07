"use client";

import * as anchor from "@coral-xyz/anchor";

import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";

import { Counter } from "@/anchor-idl/idl";
import Idl from "@/anchor-idl/idl.json";
import { useEffect } from "react";

interface UseProgramReturn {
  program: anchor.Program<Counter>;
  counterAddress: PublicKey;
  publicKey: PublicKey | null;
  connected: boolean;
  connection: anchor.web3.Connection;
}

/**
 * A hook that provides access to the Solana program, counter address,
 * connected wallet, and connection.
 * This hook handles the basic setup for the program.
 */
export function useProgram(): UseProgramReturn {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  // Program initialization - conditionally create with provider if wallet connected
  let program;
  if (wallet) {
    // Create a provider with the wallet for transaction signing
    const provider = new anchor.AnchorProvider(connection, wallet, {
      preflightCommitment: "confirmed",
    });
    program = new anchor.Program<Counter>(Idl, provider);
  } else {
    // Create program with just connection for read-only operations
    program = new anchor.Program<Counter>(Idl, { connection });
  }

  // Get the counter account address
  const counterAddress = PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    new PublicKey(Idl.address)
  )[0];

  // Fund connected wallet with devnet SOL
  useEffect(() => {
    const airdropDevnetSol = async () => {
      if (!publicKey) return;

      try {
        const balance = await connection.getBalance(publicKey);
        const solBalance = balance / LAMPORTS_PER_SOL;

        if (solBalance < 1) {
          await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
        }
      } catch (error) {
        console.log(error);
      }
    };

    airdropDevnetSol();
  }, [publicKey]);

  return {
    program,
    counterAddress,
    publicKey,
    connected,
    connection,
  };
}
