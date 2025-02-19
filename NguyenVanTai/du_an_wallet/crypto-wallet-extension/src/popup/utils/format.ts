import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function formatAddress(address: string | undefined | null): string {
  if (!address || typeof address !== 'string') {
    return 'Unknown';
  }
  try {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  } catch {
    return 'Invalid address';
  }
}

export function formatAmount(lamports: number): string {
    const solAmount = lamports;
    return `${solAmount.toFixed(9)} SOL`;
}

export function formatBalance(lamports: number): string {
  return (lamports / LAMPORTS_PER_SOL).toFixed(4) + ' SOL';
}