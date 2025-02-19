import { Transaction } from '@solana/web3.js'; 
import { WalletService } from '../../services/wallet';
import { TransactionData } from './types';

export async function handleTransactionSign() {
  try {
    const data = await chrome.storage.local.get(['pendingTransaction']);
    const transactionData = data.pendingTransaction as TransactionData;

    if (!transactionData) {
      throw new Error('No pending transaction found');
    }

    // Create transaction from serialized data
    const transaction = Transaction.from(Buffer.from(transactionData.serialized, 'base64'));
    
    // Sign transaction
    const walletService = WalletService.getInstance();
    const signedTx = await walletService.signTransaction(transaction);

    // Send response
    chrome.runtime.sendMessage({
      type: 'SIGN_TRANSACTION_RESPONSE',
      approved: true,
      signedTx: signedTx.serialize().toString('base64')
    });

  } catch (error) {
    console.error('Error signing transaction:', error);
    chrome.runtime.sendMessage({
      type: 'SIGN_TRANSACTION_RESPONSE', 
      approved: false,
      error: error instanceof Error ? error.message : 'Failed to sign transaction'
    });
  }
}