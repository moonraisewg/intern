import { PublicKey, Transaction } from '@solana/web3.js';

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      isSolanaWallet: boolean;
      publicKey: PublicKey | null;
      connect(): Promise<{ publicKey: PublicKey }>;
      disconnect(): Promise<void>;
      signTransaction(transaction: Transaction): Promise<Transaction>;
      signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
      signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    }
  }
} 