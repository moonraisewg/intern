import { WalletService } from '../services/wallet';
import * as web3 from '@solana/web3.js';
import { ConnectionService } from '../services/connection';

document.addEventListener('DOMContentLoaded', async () => {
  const walletService = new WalletService();
  const connectionService = new ConnectionService();

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

  const signTransactionModal = document.getElementById('sign-transaction-modal');
  const txSiteIcon = document.getElementById('tx-site-icon') as HTMLImageElement;
  const txSiteOrigin = document.getElementById('tx-site-origin');
  const txFrom = document.getElementById('tx-from');
  const txTo = document.getElementById('tx-to');
  const txAmount = document.getElementById('tx-amount');
  const txFee = document.getElementById('tx-fee');
  const approveTransactionBtn = document.getElementById('approve-transaction');
  const rejectTransactionBtn = document.getElementById('reject-transaction');

  // Kiểm tra các elements cần thiết
  if (!walletInfo || !createWallet || !connectModal || !siteOrigin || !walletAddress) {
    console.error('Required elements not found');
    return;
  }

  // Xử lý hash URL để hiển thị đúng màn hình
  const hash = window.location.hash;
  if (hash.startsWith('#connect')) {
    const params = new URLSearchParams(hash.substring(hash.indexOf('?')));
    const origin = params.get('origin');
    
    if (origin) {
      // Kiểm tra ví đã tồn tại chưa
      const address = await walletService.getAddress();
      if (!address) {
        // Hiển thị màn hình tạo ví
        walletInfo.style.display = 'none';
        createWallet.style.display = 'block';
        connectModal.style.display = 'none';
        
        // Thêm thông báo
        const messageElement = document.createElement('p');
        messageElement.className = 'warning-text';
        messageElement.textContent = 'Vui lòng tạo ví hoặc đăng nhập trước khi kết nối!';
        createWallet.insertBefore(messageElement, createWallet.firstChild);
        
        return;
      }

      // Nếu có ví, hiển thị modal xác nhận kết nối
      walletInfo.style.display = 'none';
      createWallet.style.display = 'none';
      connectModal.style.display = 'block';
      
      // Hiển thị thông tin trang web
      siteOrigin.textContent = decodeURIComponent(origin);
      
      // Xử lý nút chấp nhận/từ chối
      if (approveConnectBtn && rejectConnectBtn) {
        approveConnectBtn.addEventListener('click', async () => {
          try {
            const address = await walletService.getAddress();
            console.log('Got address from wallet:', address); // Debug log
            
            if (!address) {
              console.error('No address found');
              return;
            }

            // Gửi message đến background
            chrome.runtime.sendMessage({
              type: 'CONNECTION_RESPONSE',
              approved: true,
              publicKey: address
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.error('Error sending approval:', chrome.runtime.lastError);
              } else {
                console.log('Approval sent successfully with address:', address);
              }
              window.close();
            });
          } catch (error) {
            console.error('Error getting address:', error);
          }
        });

        rejectConnectBtn.addEventListener('click', () => {
          chrome.runtime.sendMessage({
            type: 'CONNECTION_RESPONSE',
            approved: false
          }, () => window.close());
        });
      }
    }
  } else {
    // Hiển thị màn hình thông tin ví bình thường
    const address = await walletService.getAddress();
    if (address) {
      walletInfo.style.display = 'block';
      createWallet.style.display = 'none';
      walletAddress.textContent = address;

      // Cập nhật số dư
      try {
        const balance = await walletService.getBalance();
        const balanceInSOL = balance / web3.LAMPORTS_PER_SOL;
        if (walletBalance) {
          walletBalance.textContent = `${balanceInSOL} SOL`;
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        if (walletBalance) {
          walletBalance.textContent = 'Error loading balance';
        }
      }
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

      // Cập nhật số dư
      try {
        const balance = await walletService.getBalance();
        const balanceInSOL = balance / web3.LAMPORTS_PER_SOL;
        if (walletBalance) {
          walletBalance.textContent = `${balanceInSOL} SOL`;
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        if (walletBalance) {
          walletBalance.textContent = 'Error loading balance';
        }
      }
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

  // Xử lý yêu cầu kết nối
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CONNECT_REQUEST') {
      showConnectModal(message.origin, sender.tab?.favIconUrl);
    } else if (message.type === 'SIGN_TRANSACTION') {
      showSignTransactionModal(message.transaction, message.origin, sender.tab?.favIconUrl);
    }
  });

  function showConnectModal(origin: string, iconUrl?: string) {
    if (connectModal && siteOrigin && siteIcon) {
      siteOrigin.textContent = origin;
      siteIcon.src = iconUrl || 'default-icon.png';
      connectModal.style.display = 'flex';

      approveConnectBtn?.addEventListener('click', async () => {
        await connectionService.addConnectedSite(origin);
        chrome.runtime.sendMessage({
          type: 'CONNECTION_RESPONSE',
          approved: true,
          origin
        });
        connectModal.style.display = 'none';
      });

      rejectConnectBtn?.addEventListener('click', () => {
        chrome.runtime.sendMessage({
          type: 'CONNECTION_RESPONSE',
          approved: false,
          origin
        });
        connectModal.style.display = 'none';
      });
    }
  }

  function showSignTransactionModal(transaction: any, origin: string, iconUrl?: string) {
    if (signTransactionModal && txSiteOrigin && txSiteIcon) {
      txSiteOrigin.textContent = origin;
      txSiteIcon.src = iconUrl || 'default-icon.png';
      
      // Hiển thị thông tin giao dịch
      if (txFrom) txFrom.textContent = transaction.from;
      if (txTo) txTo.textContent = transaction.to;
      if (txAmount) txAmount.textContent = `${transaction.amount} SOL`;
      if (txFee) txFee.textContent = `${transaction.fee} SOL`;

      signTransactionModal.style.display = 'flex';

      approveTransactionBtn?.addEventListener('click', async () => {
        try {
          const signedTx = await walletService.signTransaction(transaction);
          chrome.runtime.sendMessage({
            type: 'TRANSACTION_RESPONSE',
            approved: true,
            signedTx,
            origin
          });
          signTransactionModal.style.display = 'none';
        } catch (error) {
          console.error('Error signing transaction:', error);
          alert('Không thể ký giao dịch. Vui lòng thử lại.');
        }
      });

      rejectTransactionBtn?.addEventListener('click', () => {
        chrome.runtime.sendMessage({
          type: 'TRANSACTION_RESPONSE',
          approved: false,
          origin
        });
        signTransactionModal.style.display = 'none';
      });
    }
  }
});
