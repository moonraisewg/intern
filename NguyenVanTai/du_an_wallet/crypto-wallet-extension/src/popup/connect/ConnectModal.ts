import { WalletService } from '../../services/wallet';
import { ConnectionService } from '../../services/connection';

interface ConnectModalElements {
  connectModal: HTMLElement;
  walletInfo: HTMLElement;
  createWallet: HTMLElement;
  siteOrigin: HTMLElement;
  siteIcon: HTMLImageElement;
  approveConnectBtn: HTMLElement | null;
  rejectConnectBtn: HTMLElement | null;
}

export async function showConnectModal(
  elements: ConnectModalElements,
  origin: string
) {
  console.log('ShowConnectModal called with elements:', {
    hasConnectModal: !!elements.connectModal,
    hasWalletInfo: !!elements.walletInfo,
    hasCreateWallet: !!elements.createWallet,
    hasSiteOrigin: !!elements.siteOrigin,
    hasSiteIcon: !!elements.siteIcon,
    hasApproveBtn: !!elements.approveConnectBtn,
    hasRejectBtn: !!elements.rejectConnectBtn
  });

  try {
    const { connectModal, walletInfo, createWallet, siteOrigin, siteIcon } = elements;
    const walletService = WalletService.getInstance();

    // Kiểm tra ví trước
    const address = await walletService.getAddress();
    console.log('Current wallet address:', address);

    if (!address) {
      // Nếu chưa có ví, hiện màn hình tạo ví
      console.log('No wallet found, showing create wallet screen');
      walletInfo.style.display = 'block';
      createWallet.style.display = 'block';
      connectModal.style.display = 'none';
      
      // Thêm thông báo
      const messageElement = document.createElement('p');
      messageElement.className = 'warning-text';
      messageElement.textContent = 'Vui lòng tạo ví trước khi kết nối!';
      createWallet.insertBefore(messageElement, createWallet.firstChild);
      return;
    }

    // Có ví rồi thì hiển thị modal kết nối
    console.log('Wallet found, showing connect modal');
    walletInfo.style.display = 'none';
    createWallet.style.display = 'none';
    connectModal.style.display = 'flex';

    // Hiển thị thông tin trang web
    siteOrigin.textContent = decodeURIComponent(origin);
    if (siteIcon) {
      siteIcon.src = 'default-icon.png';
    }

    // Setup event handlers cho nút chấp nhận/từ chối
    setupConnectButtons(elements, origin);

  } catch (error) {
    console.error('Error in showConnectModal:', error);
  }
}

function handleNoWallet(elements: ConnectModalElements) {
  const { walletInfo, createWallet, connectModal } = elements;
  
  walletInfo.style.display = 'none';
  createWallet.style.display = 'block';
  connectModal.style.display = 'none';

  const messageElement = document.createElement('p');
  messageElement.className = 'warning-text';
  messageElement.textContent = 'Vui lòng tạo ví hoặc đăng nhập trước khi kết nối!';
  createWallet.insertBefore(messageElement, createWallet.firstChild);
}

function setupModalDisplay(
  elements: ConnectModalElements,
  origin: string,
  iconUrl?: string
) {
  const { connectModal, walletInfo, createWallet, siteOrigin, siteIcon } = elements;

  walletInfo.style.display = 'none';
  createWallet.style.display = 'none';
  connectModal.style.display = 'block';

  siteOrigin.textContent = decodeURIComponent(origin);
  siteIcon.src = iconUrl || 'default-icon.png';
}

function setupConnectButtons(elements: ConnectModalElements, origin: string) {
  const { approveConnectBtn, rejectConnectBtn } = elements;
  const walletService = WalletService.getInstance();

  approveConnectBtn?.addEventListener('click', async () => {
    try {
      const address = await walletService.getAddress();
      if (!address) {
        console.error('No wallet address found');
        return;
      }

      console.log('Approving connection for address:', address);
      
      chrome.runtime.sendMessage({
        type: 'CONNECTION_RESPONSE',
        approved: true,
        publicKey: address,
        origin: origin
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error sending approval:', chrome.runtime.lastError);
        } else {
          window.close();
        }
      });

    } catch (error) {
      console.error('Error approving connection:', error);
    }
  });

  rejectConnectBtn?.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'CONNECTION_RESPONSE',
      approved: false,
      origin: origin
    }, () => window.close());
  });
}