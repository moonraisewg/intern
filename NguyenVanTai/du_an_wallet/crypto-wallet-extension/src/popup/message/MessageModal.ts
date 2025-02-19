import { WalletService } from '../../services/wallet';
import { handleMessageSign } from './MessageHandler';

export interface MessageModalElements {
  signMessageModal: HTMLElement;
  messageOrigin: HTMLElement;
  messageContent: HTMLElement;
  approveSignBtn: HTMLElement | null;
  rejectSignBtn: HTMLElement | null;
  walletInfo: HTMLElement;
  createWallet: HTMLElement;
}

export async function showSignMessageModal(
  elements: MessageModalElements,
  origin: string,
  encodedMessage: string
) {
  const { signMessageModal, messageOrigin, messageContent, walletInfo, createWallet } = elements;

  try {
    // Decode message từ base64
    const messageBytes = new Uint8Array(
      atob(encodedMessage)
        .split('')
        .map(c => c.charCodeAt(0))
    );

    // Hiển thị UI
    walletInfo.style.display = 'none';
    createWallet.style.display = 'none';
    signMessageModal.style.display = 'block';
    
    messageOrigin.textContent = decodeURIComponent(origin);
    messageContent.textContent = new TextDecoder().decode(messageBytes);

    // Setup message handlers
    setupMessageButtons(elements, messageBytes);

  } catch (error) {
    handleMessageError(error);
  }
}

function setupMessageButtons(elements: MessageModalElements, messageBytes: Uint8Array) {
  const { approveSignBtn, rejectSignBtn } = elements;

  approveSignBtn?.addEventListener('click', () => handleMessageSign(messageBytes, true));
  rejectSignBtn?.addEventListener('click', () => handleMessageSign(messageBytes, false));
}

function handleMessageError(error: unknown) {
  console.error('Error showing message modal:', error);
  chrome.runtime.sendMessage({
    type: 'SIGN_MESSAGE_RESPONSE',
    approved: false,
    error: error instanceof Error ? error.message : 'Failed to show message modal'
  });
  window.close();
}