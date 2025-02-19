import { Transaction, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { WalletService } from '../../services/wallet';
import { TransactionData } from './types';
import { formatAddress, formatAmount } from '../utils/format';

export async function handleTransactionSign() {
  try {
    const data = await chrome.storage.local.get(['pendingTransaction']);
    const transactionData = data.pendingTransaction as TransactionData;

    if (!transactionData) {
      throw new Error('No pending transaction found');
    }

    const transaction = Transaction.from(Buffer.from(transactionData.serialized, 'base64'));
    const walletService = WalletService.getInstance();
    const signedTx = await walletService.signTransaction(transaction);

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

export async function displayTransactionDetails() {
  try {
    const data = await chrome.storage.local.get(['pendingTransaction']);
    const transaction = data.pendingTransaction;

    if (!transaction) {
      throw new Error('No transaction data found');
    }

    const transferInstruction = transaction.instructions.find(
      (inst: any) => inst.programId === SystemProgram.programId.toBase58()
    );

    if (!transferInstruction) {
      throw new Error('Not a transfer transaction');
    }

    const recipient = transferInstruction.keys.find(
      (key: any) => key.isWritable && !key.isSigner
    )?.pubkey;

    const dataBuffer = Buffer.from(transferInstruction.data, 'base64');
    const amount = Number(dataBuffer.readBigUInt64LE(0)) / LAMPORTS_PER_SOL;

    updateTransactionUI(transaction, recipient, amount);

  } catch (error) {
    console.error('Error displaying transaction details:', error);
    showTransactionError(error);
  }
}

function updateTransactionUI(transaction: TransactionData, recipient: string, amount: number) {
  const elements = {
    from: document.getElementById('from-address'),
    to: document.getElementById('to-address'), 
    amount: document.getElementById('amount'),
    fee: document.getElementById('fee'),
    program: document.getElementById('program-id'),
    total: document.getElementById('total-amount')
  };

  if (elements.from) {
    elements.from.textContent = formatAddress(transaction.feePayer);
    elements.from.title = transaction.feePayer;
  }

  if (elements.to) {
    elements.to.textContent = formatAddress(recipient);
    elements.to.title = recipient;
  }

  if (elements.amount) {
    elements.amount.textContent = formatAmount(amount);
  }

  if (elements.fee) {
    elements.fee.textContent = '0.000005 SOL';
  }

  if (elements.program) {
    elements.program.textContent = 'System Program (Transfer)';
  }

  if (elements.total) {
    elements.total.textContent = formatAmount(amount + 0.000005);
  }

  const container = document.getElementById('transaction-details');
  if (container) {
    container.style.display = 'block';
  }
}

function showTransactionError(error: any) {
  const errorElement = document.getElementById('transaction-error');
  if (errorElement) {
    errorElement.textContent = error instanceof Error ? error.message : 'Failed to load transaction details';
  }
}