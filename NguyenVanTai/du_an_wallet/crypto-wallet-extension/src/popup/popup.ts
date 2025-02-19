import { WalletService } from '../services/wallet';
import * as web3 from '@solana/web3.js';
import { ConnectionService } from '../services/connection';
import { setupEventHandlers } from './EventHandlers';
import { LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import { showSignTransactionModal } from './transaction/TransactionModal';
import { TransactionData, TransactionKey } from './transaction/types';
import {  formatBalance,formatAddress,formatAmount } from './utils/format';
import { handleTransactionSign,} from './transaction/handlers';
import { showConnectModal } from './connect/ConnectModal';
import { showSignMessageModal } from './message/MessageModal';

let isProcessing = false;
document.addEventListener('DOMContentLoaded', async () => {
  const walletService = WalletService.getInstance();
  const connectionService = ConnectionService.getInstance();

  // Các elements
  const walletInfo = document.getElementById('wallet-info');
  const createWallet = document.getElementById('create-wallet');
  const walletAddress = document.getElementById('wallet-address');
  const walletBalance = document.getElementById('wallet-balance');
  const createWalletBtn = document.getElementById('create-wallet-btn');
  const copyAddressBtn = document.getElementById('copy-address');
  const seedPhraseModal = document.getElementById('seed-phrase-modal');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings');
  const viewSeedPhraseBtn = document.getElementById('view-seed-phrase');
  const networkSelect = document.getElementById('network-select') as HTMLSelectElement;
  const logoutBtn = document.getElementById('logout-btn');
  const logoutConfirmModal = document.getElementById('logout-confirm-modal');
  const cancelLogoutBtn = document.getElementById('cancel-logout');
  const confirmLogoutBtn = document.getElementById('confirm-logout');
  const connectModal = document.getElementById('connect-modal');
  const siteOrigin = document.getElementById('site-origin');
  const siteIcon = document.getElementById('site-icon') as HTMLImageElement;
  const approveConnectBtn = document.getElementById('approve-connect');
  const rejectConnectBtn = document.getElementById('reject-connect');

  // Kiểm tra các elements cần thiết
  if (!walletInfo || !createWallet || !connectModal || !siteOrigin || !walletAddress) {
    console.error('Required elements not found');
    return;
  }

  const hash = window.location.hash;
  
  if (hash.startsWith('#sign-transaction')) {
    try {
        const params = new URLSearchParams(hash.substring(hash.indexOf('?')));
        const origin = params.get('origin');
        const transactionData = params.get('transaction');
        
        if (origin && transactionData) {
            console.log('Raw transaction data:', transactionData);
            
            // Parse transaction data từ mảng số
            const transactionArray = JSON.parse(decodeURIComponent(transactionData));
            console.log('Parsed transaction array:', transactionArray);
            
            // Tạo Uint8Array từ mảng số
            const transactionUint8 = new Uint8Array(transactionArray);
            console.log('Transaction Uint8Array:', transactionUint8);

            // Tạo Transaction object và chuyển đổi sang TransactionData
            const transaction = Transaction.from(transactionUint8);
            const convertedTransactionData: TransactionData = {
                serialized: Buffer.from(transactionUint8).toString('base64'),
                recentBlockhash: transaction.recentBlockhash || '',
                feePayer: transaction.feePayer?.toBase58() || '',
                instructions: transaction.instructions.map(instruction => ({
                    programId: instruction.programId.toBase58(),
                    keys: instruction.keys.map(key => ({
                        pubkey: key.pubkey.toBase58(),
                        isSigner: key.isSigner,
                        isWritable: key.isWritable
                    })),
                    // Keep the original instruction data as Uint8Array
                    data: Buffer.from(instruction.data)  // Convert to Buffer to ensure Uint8Array compatibility
                }))
            };

            // Ẩn các màn hình khác
            if (walletInfo) walletInfo.style.display = 'none';
            if (createWallet) createWallet.style.display = 'none';
            if (connectModal) connectModal.style.display = 'none';

            // Hiển thị modal giao dịch
            showSignTransactionModal(convertedTransactionData, decodeURIComponent(origin));
        }
    } catch (error) {
        console.error('Error processing transaction:', error);
    }
}
else if (hash.startsWith('#connect')) {
  const params = new URLSearchParams(hash.substring(hash.indexOf('?')));
  const origin = params.get('origin');
  
  if (origin) {
    console.log('Opening connect modal for origin:', origin);
    
    // Kiểm tra elements trước khi gọi showConnectModal
    if (!connectModal || !walletInfo || !createWallet || !siteOrigin || !siteIcon || !approveConnectBtn || !rejectConnectBtn) {
      console.error('Missing required elements for connect modal');
      return;
    }

    // Ẩn các màn hình khác trước khi hiển thị modal
    walletInfo.style.display = 'none';
    createWallet.style.display = 'none';
    
    // Hiển thị modal kết nối
    await showConnectModal({
      connectModal,
      walletInfo,
      createWallet,
      siteOrigin,
      siteIcon,
      approveConnectBtn,
      rejectConnectBtn
    }, decodeURIComponent(origin));
  }
} else if (hash.startsWith('#sign-message')) {
    const params = new URLSearchParams(hash.substring(hash.indexOf('?')));
    const origin = params.get('origin');
    const encodedMessage = params.get('message');
    
    if (origin && encodedMessage) {
      const signMessageModal = document.getElementById('sign-message-modal');
      const messageOrigin = document.getElementById('message-origin');
      const messageContent = document.getElementById('message-content');
      const approveSignBtn = document.getElementById('approve-sign-message');
      const rejectSignBtn = document.getElementById('reject-sign-message');

      // Kiểm tra tất cả elements cần thiết có tồn tại không
      if (signMessageModal && messageOrigin && messageContent) {
        const elements = {
          signMessageModal,  // Đã xác định không null
          messageOrigin,     // Đã xác định không null
          messageContent,    // Đã xác định không null
          approveSignBtn,
          rejectSignBtn,
          walletInfo,       // Đã xác định từ trước
          createWallet      // Đã xác định từ trước
        } as const;         // Khóa kiểu của object

        await showSignMessageModal(elements, origin, encodedMessage);
      } else {
        console.error('Required message modal elements not found');
      }
    }
}
  else {
    // Hiển thị màn hình thông tin ví bình thường
    const address = await walletService.getAddress();
    if (address) {
      walletInfo.style.display = 'block';
      createWallet.style.display = 'none';
      walletAddress.textContent = address;

      // Cập nhật số dư ngay lập tức
      updateBalance();

      // Tự động cập nhật số dư mỗi 30 giây
      const balanceInterval = setInterval(updateBalance, 30000);

      // Cleanup interval khi đóng popup
      window.addEventListener('unload', () => {
        clearInterval(balanceInterval);
      });
    } else {
      walletInfo.style.display = 'none';
      createWallet.style.display = 'block';
    }
  }

  // Xử lý tạo ví mới
  createWalletBtn?.addEventListener('click', async () => {
    try {
      const { address, seedPhrase } = await walletService.createWallet();
      const words = seedPhrase.split(' ');
      
      // Hiển thị seed phrase modal
      if (seedPhraseModal) {
        seedPhraseModal.style.display = 'flex';
        const grid = document.querySelector('.seed-phrase-grid');
        if (grid) {
          grid.innerHTML = words.map((word, index) => `
            <div class="seed-word-container">
              <span class="seed-word-number">${index + 1}</span>
              <input type="text" class="seed-word" value="${word}" readonly>
            </div>
          `).join('');
        }

        // Xử lý copy từng từ
        const copySeedBtn = document.getElementById('copy-seed');
        copySeedBtn?.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(seedPhrase);
            const originalText = copySeedBtn.innerHTML;
            copySeedBtn.innerHTML = '<span>✓</span><span>Đã sao chép</span>';
            setTimeout(() => {
              copySeedBtn.innerHTML = originalText;
            }, 2000);
          } catch (error) {
            console.error('Error copying seed phrase:', error);
            alert('Không thể sao chép từ khóa bí mật');
          }
        });

        // Xử lý copy tất cả để paste
        const copyAllSeedBtn = document.getElementById('copy-all-seed');
        copyAllSeedBtn?.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(seedPhrase);
            alert('Đã sao chép tất cả từ khóa. Bạn có thể dán vào bước xác nhận.');
          } catch (error) {
            console.error('Error copying all seeds:', error);
            alert('Không thể sao chép từ khóa');
          }
        });
      }

      const confirmSeedModal = document.getElementById('confirm-seed-modal');

      // Xử lý nút Tiếp tục
      const continueBtn = document.getElementById('continue-seed');
      continueBtn?.addEventListener('click', () => {
        if (seedPhraseModal && confirmSeedModal) {
          seedPhraseModal.style.display = 'none';
          confirmSeedModal.style.display = 'flex';
          
          // Tạo grid xác nhận
          const confirmGrid = document.getElementById('confirm-seed-grid');
          if (confirmGrid) {
            confirmGrid.innerHTML = words.map((_, index) => `
              <div class="seed-word-container">
                <span class="seed-word-number">${index + 1}</span>
                <input type="text" class="seed-word" placeholder="Từ thứ ${index + 1}">
              </div>
            `).join('');
          }
        }
      });

      // Xử lý paste tất cả
      const pasteAllSeedBtn = document.getElementById('paste-all-seed');
      pasteAllSeedBtn?.addEventListener('click', async () => {
        try {
          const clipboardText = await navigator.clipboard.readText();
          const inputs = document.querySelectorAll('#confirm-seed-grid .seed-word') as NodeListOf<HTMLInputElement>;
          const pastedWords = clipboardText.trim().split(' ');
          
          if (pastedWords.length === inputs.length) {
            inputs.forEach((input, index) => {
              input.value = pastedWords[index];
            });
          } else {
            alert('Số từ không khớp với seed phrase. Vui lòng kiểm tra lại.');
          }
        } catch (error) {
          console.error('Error pasting seeds:', error);
          // Thông báo lỗi chi tiết hơn
          if ((error as Error).message.includes('denied')) {
            alert('Vui lòng cho phép quyền truy cập clipboard để dán từ khóa');
          } else {
            alert('Không thể dán từ khóa. Vui lòng thử lại hoặc nhập thủ công.');
          }
        }
      });

      // Xử lý nút Xác nhận
      const confirmBtn = document.getElementById('confirm-seed');
      confirmBtn?.addEventListener('click', () => {
        const inputs = document.querySelectorAll('#confirm-seed-grid .seed-word') as NodeListOf<HTMLInputElement>;
        const inputWords = Array.from(inputs).map(input => input.value.trim());
        
        if (inputWords.join(' ') === seedPhrase) {
          if (confirmSeedModal) {
            confirmSeedModal.style.display = 'none';
          }
          showWalletInfo(address);
        } else {
          alert('Từ khóa không khớp. Vui lòng thử lại!');
        }
      });

      // Xử lý các nút Quay lại
      const backCreateBtn = document.getElementById('back-to-create');
      backCreateBtn?.addEventListener('click', () => {
        if (seedPhraseModal) {
          seedPhraseModal.style.display = 'none';
        }
      });

      const backSeedBtn = document.getElementById('back-to-seed');
      backSeedBtn?.addEventListener('click', () => {
        if (confirmSeedModal) {
          confirmSeedModal.style.display = 'none';
        }
        if (seedPhraseModal) {
          seedPhraseModal.style.display = 'flex';
        }
      });

    } catch (error) {
      console.error('Error creating wallet:', error);
      alert('Không thể tạo ví: ' + (error as Error).message);
    }
  });

  // Copy địa chỉ ví
  copyAddressBtn?.addEventListener('click', async () => {
    const address = await walletService.getAddress();
    if (address) {
      await navigator.clipboard.writeText(address);
      alert('Đã copy địa chỉ ví!');
    }
  });

  // Hàm hiển thị thông tin ví
  async function showWalletInfo(address: string) {
    if (walletInfo && createWallet && walletAddress) {
      walletInfo.style.display = 'block';
      createWallet.style.display = 'none';
      walletAddress.textContent = address;

      // Cập nhật số dư ngay lập tức
      updateBalance();

      // Tự động cập nhật số dư mỗi 30 giây
      const balanceInterval = setInterval(updateBalance, 30000);

      // Cleanup interval khi đóng popup
      window.addEventListener('unload', () => {
        clearInterval(balanceInterval);
      });
    }
  }

  // Xử lý mở/đóng modal cài đặt
  settingsBtn?.addEventListener('click', () => {
    if (settingsModal) {
      settingsModal.style.display = 'flex';
    }
  });

  closeSettingsBtn?.addEventListener('click', () => {
    if (settingsModal) {
      settingsModal.style.display = 'none';
    }
  });

  // Xử lý chọn mạng
  networkSelect?.addEventListener('change', async () => {
    try {
      await walletService.setNetwork(networkSelect.value);
      // Cập nhật lại số dư
      const address = await walletService.getAddress();
      if (address) {
        showWalletInfo(address);
      }
    } catch (error) {
      console.error('Error changing network:', error);
      alert('Không thể thay đổi mạng. Vui lòng thử lại.');
    }
  });

  // Xử lý đăng xuất
  logoutBtn?.addEventListener('click', () => {
    if (logoutConfirmModal) {
      logoutConfirmModal.style.display = 'flex';
    }
  });

  cancelLogoutBtn?.addEventListener('click', () => {
    if (logoutConfirmModal) {
      logoutConfirmModal.style.display = 'none';
    }
  });

  confirmLogoutBtn?.addEventListener('click', async () => {
    try {
      await walletService.logout();
      // Reset UI về trạng thái ban đầu
      if (walletInfo && createWallet && logoutConfirmModal) {
        walletInfo.style.display = 'none';
        createWallet.style.display = 'block';
        logoutConfirmModal.style.display = 'none';
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Không thể đăng xuất. Vui lòng thử lại.');
    }
  });

  // Xử lý xem seed phrase
  viewSeedPhraseBtn?.addEventListener('click', async () => {
    try {
      const seedPhrase = await walletService.getSeedPhrase();
      if (seedPhrase && seedPhraseModal) {
        // Hiển thị seed phrase trong modal
        const grid = document.querySelector('.seed-phrase-grid');
        if (grid) {
          const words = seedPhrase.split(' ');
          grid.innerHTML = words.map((word, index) => `
            <div class="seed-word-container">
              <span class="seed-word-number">${index + 1}</span>
              <input type="text" class="seed-word" value="${word}" readonly>
            </div>
          `).join('');
        }
        settingsModal!.style.display = 'none';
        seedPhraseModal.style.display = 'flex';
      }
    } catch (error) {
      console.error('Error viewing seed phrase:', error);
      alert('Không thể hiển thị cụm từ khôi phục. Vui lòng thử lại.');
    }
  });

  // Kết nối với background
  const port = chrome.runtime.connect({ name: 'popup' });
  
  // Thông báo popup đã sẵn sàng
  port.postMessage({ type: 'POPUP_READY' });
  
  // Lắng nghe message từ background
  port.onMessage.addListener((msg) => {
    if (msg.type === 'SHOW_TRANSACTION') {
      showSignTransactionModal(msg.transaction, msg.origin);
    }
  });


  function showSignTransactionModal(transaction: TransactionData, origin: string) {
    const signTransactionModal = document.getElementById('sign-transaction-modal');
    const txOrigin = document.getElementById('tx-site-origin');
    const txFrom = document.getElementById('tx-from');
    const txTo = document.getElementById('tx-to');
    const txAmount = document.getElementById('tx-amount');
    const approveTransactionBtn = document.getElementById('approve-transaction-btn');
    const rejectTransactionBtn = document.getElementById('reject-transaction-btn');
    
    if (signTransactionModal && txOrigin && txFrom && txTo && txAmount) {
        try {
            // Hiển thị origin và địa chỉ người gửi
            txOrigin.textContent = origin || 'Unknown origin';
            txFrom.textContent = formatAddress(transaction.feePayer);

            // Khôi phục transaction để lấy thông tin người nhận
            const rawTransaction = Transaction.from(Buffer.from(transaction.serialized, 'base64'));

            // Lấy instruction chuyển SOL
            const transferInstruction = rawTransaction.instructions.find(
                inst => inst.programId.toBase58() === SystemProgram.programId.toBase58()
            );

            if (transferInstruction) {
                // Lấy địa chỉ người nhận từ instruction
                const recipientPubkey = transferInstruction.keys[1].pubkey;
                const recipientAddress = recipientPubkey.toBase58();
                txTo.textContent = formatAddress(recipientAddress);

                // Parse số lượng SOL
                const dataBuffer = transferInstruction.data;
                const lamports = dataBuffer.readBigUInt64LE(4);
                const amount = Number(lamports) / LAMPORTS_PER_SOL;
                txAmount.textContent = formatAmount(amount);
            } else {
                throw new Error('Invalid transfer instruction');
            }

            // Thêm event listeners cho các nút
            approveTransactionBtn?.addEventListener('click', async () => {
                try {
                    await handleTransactionSign();
                    signTransactionModal.style.display = 'none';
                } catch (error) {
                    console.error('Error approving transaction:', error);
                }
            });

            rejectTransactionBtn?.addEventListener('click', () => {
                chrome.runtime.sendMessage({
                    type: 'SIGN_TRANSACTION_RESPONSE',
                    approved: false,
                    error: 'User rejected transaction'
                });
                signTransactionModal.style.display = 'none';
            });

            signTransactionModal.style.display = 'flex';
        } catch (error) {
            console.error('Error showing transaction modal:', error);
        }
    }
}

  // Thêm hàm update balance
  async function updateBalance() {
    try {
      const balance = await walletService.getBalance();
      const balanceInSOL = balance / LAMPORTS_PER_SOL;
      if (walletBalance) {
        walletBalance.textContent = formatBalance(balance);
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      if (walletBalance) {
        walletBalance.textContent = 'Error loading balance';
      }
    }
  }

  // Thêm nút refresh balance
  const refreshBalanceBtn = document.getElementById('refresh-balance');
  refreshBalanceBtn?.addEventListener('click', () => {
    updateBalance();
  });

  setupEventHandlers();

  // Thêm hàm để kiểm tra trạng thái popup
  async function initializePopup() {
    console.log('Initializing popup...');
    
    // Kiểm tra xem có transaction đang chờ không
    chrome.storage.local.get(['pendingTransaction'], (result) => {
      const transactionData = result.pendingTransaction;
      if (!transactionData?.serialized) {
        console.error('Invalid transaction data:', transactionData);
        chrome.runtime.sendMessage({
          type: 'SIGN_TRANSACTION_RESPONSE',
          approved: false,
          error: 'Invalid transaction data format'
        });
        return;
      }
      
      try {
        const transactionBuffer = Buffer.from(transactionData.serialized, 'base64');
        const transaction = Transaction.from(transactionBuffer);
        showSignTransactionModal(transactionData, result.transactionOrigin);
      } catch (e) {
        console.error('Error parsing transaction:', e);
        chrome.runtime.sendMessage({
          type: 'SIGN_TRANSACTION_RESPONSE',
          approved: false,
          error: 'Invalid transaction format'
        });
      }
    });

    // Kiểm tra các kết nối hiện tại
    const connections = await connectionService.getConnectedSites();
    console.log('Current connections:', connections);
  }

  // Gọi hàm initialize khi popup mở
  console.log('Popup loaded');
  initializePopup();

  // Thêm listener cho window load
  window.addEventListener('load', () => {
    console.log('Window loaded');
    // Kiểm tra URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('transaction')) {
      try {
        const transaction = JSON.parse(urlParams.get('transaction') || '');
        const origin = urlParams.get('origin') || 'Unknown';
        showSignTransactionModal(transaction, origin);
      } catch (error) {
        console.error('Error parsing transaction from URL:', error);
      }
    }
  });
});
