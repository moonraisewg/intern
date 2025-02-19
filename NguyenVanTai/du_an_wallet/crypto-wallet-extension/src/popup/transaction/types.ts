import { PublicKey } from '@solana/web3.js';

export interface TransactionInstruction {
  programId: string;
  keys: TransactionKey[];
  data: Uint8Array;  
}

export interface TransactionData {
  serialized: string;
  recentBlockhash: string;
  feePayer: string;
  instructions: TransactionInstruction[];
}

export interface TransactionKey {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
}