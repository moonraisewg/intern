import { WalletService } from '../../services/wallet';

let isProcessing = false;

export async function handleMessageSign(messageBytes: Uint8Array, approved: boolean) {
  if (isProcessing) return;
  isProcessing = true;

  try {
    if (approved) {
      const walletService = WalletService.getInstance();
      const signature = await walletService.signMessage(messageBytes);

      chrome.runtime.sendMessage({
        type: 'SIGN_MESSAGE_RESPONSE',
        approved: true,
        signature: Array.from(signature)
      });
    } else {
      chrome.runtime.sendMessage({
        type: 'SIGN_MESSAGE_RESPONSE',
        approved: false,
        error: 'User rejected message signing'
      });
    }
  } catch (error) {
    console.error('Error handling message sign:', error);
    chrome.runtime.sendMessage({
      type: 'SIGN_MESSAGE_RESPONSE',
      approved: false,
      error: error instanceof Error ? error.message : 'Failed to sign message'
    });
  } finally {
    isProcessing = false;
    setTimeout(() => window.close(), 100);
  }
}