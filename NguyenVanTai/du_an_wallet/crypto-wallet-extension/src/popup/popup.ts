import { WalletService } from '../services/wallet';
import * as web3 from '@solana/web3.js';
import { ConnectionService } from '../services/connection';
import { setupEventHandlers } from './EventHandlers';
import { LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';

let isProcessing = false;

interface TransactionData {
  serialized: string;
  recentBlockhash: string;
  feePayer: string;
  instructions: {
    programId: string;
    keys: Array<{
      pubkey: any; // Thay đổi từ string sang any để hỗ trợ cả PublicKey object
      isSigner: boolean;
      isWritable: boolean;
    }>;
    data: string;
  }[];
}

interface TransactionKey {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
}

async function displayTransactionDetails() {
  try {
    const data = await chrome.storage.local.get(['pendingTransaction']);
    const transaction = data.pendingTransaction;

    if (!transaction) {
      throw new Error('No transaction data found');
    }

    console.log('Raw transaction data:', transaction);

    // Tìm instruction chuyển SOL (System Program)
    const transferInstruction = transaction.instructions.find(
      (inst: any) => inst.programId === '11111111111111111111111111111111'
    );

    if (!transferInstruction) {
      throw new Error('Not a transfer transaction');
    }

    // Tìm người nhận (địa chỉ đích trong instruction)
    const recipient = transferInstruction.keys.find(
      (key: any) => key.isWritable && !key.isSigner
    )?.pubkey;

    // Decode số lượng SOL từ data của instruction
    const dataBuffer = Buffer.from(transferInstruction.data, 'base64');
    const amount = Number(dataBuffer.readBigUInt64LE(0)) / LAMPORTS_PER_SOL;

    function formatAddress(address: string | undefined | null): string {
      if (!address || typeof address !== 'string') {
          return 'Unknown';
      }
      return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }

    // Format số lượng SOL
    const formatAmount = (sol: number) => {
      return `${sol.toFixed(9)} SOL`;
    };

    // Cập nhật UI
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
      elements.from.title = transaction.feePayer; // Hiển thị địa chỉ đầy đủ khi hover
    }

    if (elements.to) {
      elements.to.textContent = formatAddress(recipient);
      elements.to.title = recipient; // Hiển thị địa chỉ đầy đủ khi hover
    }

    if (elements.amount) {
      elements.amount.textContent = formatAmount(amount);
    }

    if (elements.fee) {
      elements.fee.textContent = '0.000005 SOL'; // Phí cố định cho giao dịch đơn giản
    }

    if (elements.program) {
      elements.program.textContent = 'System Program (Transfer)';
    }

    if (elements.total) {
      elements.total.textContent = formatAmount(amount + 0.000005); // Tổng = số lượng + phí
    }

    // Hiển thị container khi đã load xong dữ liệu
    const container = document.getElementById('transaction-details');
    if (container) {
      container.style.display = 'block';
    }

  } catch (error) {
    console.error('Error displaying transaction details:', error);
    const errorElement = document.getElementById('transaction-error');
    if (errorElement) {
      errorElement.textContent = error instanceof Error ? error.message : 'Failed to load transaction details';
    }
  }
}

// Sửa lại hàm formatAddress
function formatAddress(address: string | undefined | null): string {
  if (!address || typeof address !== 'string') {
      return 'Unknown';
  }
  try {
      return `${address.slice(0, 4)}...${address.slice(-4)}`;
  } catch {
      return 'Invalid address';
  }
}

// Thêm hàm để format số lượng SOL
function formatAmount(lamports: number): string {
  return (lamports / LAMPORTS_PER_SOL).toFixed(9) + ' SOL';
}

async function handleTransactionSign() {
  try {
    const data = await chrome.storage.local.get(['pendingTransaction']);
    const transactionData = data.pendingTransaction as TransactionData;

    if (!transactionData) {
      throw new Error('No pending transaction found');
    }

    // Khôi phục transaction từ dữ liệu
    const transaction = Transaction.from(Buffer.from(transactionData.serialized, 'base64'));
    
    // Ký transaction
    const walletService = WalletService.getInstance();
    const signedTx = await walletService.signTransaction(transaction);

    // Gửi response
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

  const signTransactionModal = document.getElementById('sign-transaction-modal');
  const txSiteIcon = document.getElementById('tx-site-icon') as HTMLImageElement;
  const txSiteOrigin = document.getElementById('tx-site-origin');
  const txFrom = document.getElementById('tx-from');
  const txToInput = document.getElementById('tx-to-input') as HTMLInputElement;
  const txAmountInput = document.getElementById('tx-amount-input') as HTMLInputElement;
  const txFee = document.getElementById('tx-fee');
  const approveTransactionBtn = document.getElementById('approve-transaction-btn');
  const rejectTransactionBtn = document.getElementById('reject-transaction-btn');

  // Kiểm tra các elements cần thiết
  if (!walletInfo || !createWallet || !connectModal || !siteOrigin || !walletAddress) {
    console.error('Required elements not found');
    return;
  }

  // Xử lý hash URL để hiển thị đúng màn hình
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
                    data: Buffer.from(instruction.data).toString('base64')
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

      if (signMessageModal && messageOrigin && messageContent) {
        try {
          console.log('Preparing to sign message');

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
          // Hiển thị message dưới dạng text nếu có thể
          messageContent.textContent = new TextDecoder().decode(messageBytes);

          // Xử lý approve
          approveSignBtn?.addEventListener('click', async () => {
            if (isProcessing) return;
            isProcessing = true;
            
            try {
              console.log('User approved signing');
              const signature = await walletService.signMessage(messageBytes);
              
              console.log('Message signed successfully:', {
                signature: Array.from(signature)
              });

              // Gửi response và đợi confirmation
              chrome.runtime.sendMessage({
                type: 'SIGN_MESSAGE_RESPONSE',
                approved: true,
                signature: Array.from(signature)
              }, () => {
                if (chrome.runtime.lastError) {
                  console.log('Message port closed:', chrome.runtime.lastError.message);
                }
                // Đóng popup sau khi xử lý error
                setTimeout(() => window.close(), 100);
              });

            } catch (error) {
              console.error('Error signing message:', error);
              chrome.runtime.sendMessage({
                type: 'SIGN_MESSAGE_RESPONSE',
                approved: false,
                error: error instanceof Error ? error.message : 'Failed to sign message'
              }, () => {
                if (chrome.runtime.lastError) {
                  console.log('Message port closed:', chrome.runtime.lastError.message);
                }
                setTimeout(() => window.close(), 100);
              });
            } finally {
              isProcessing = false;
            }
          });

          // Xử lý reject
          rejectSignBtn?.addEventListener('click', () => {
            if (isProcessing) return;
            isProcessing = true;
            
            console.log('User rejected signing');
            chrome.runtime.sendMessage({
              type: 'SIGN_MESSAGE_RESPONSE',
              approved: false,
              error: 'User rejected message signing'
            }, () => {
              if (chrome.runtime.lastError) {
                console.log('Message port closed:', chrome.runtime.lastError.message);
              }
              setTimeout(() => window.close(), 100);
            });
          });
        } catch (error) {
          console.error('Error preparing message signing:', error);
          chrome.runtime.sendMessage({
            type: 'SIGN_MESSAGE_RESPONSE',
            approved: false,
            error: error instanceof Error ? error.message : 'Failed to prepare message signing'
          });
          window.close();
        }
      }
    }
  } else {
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

  // Sửa lại phần xử lý địa chỉ người nhận trong showSignTransactionModal
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
            console.log('Processing transaction:', transaction);

            // Hiển thị origin và địa chỉ người gửi
            txOrigin.textContent = origin || 'Unknown origin';
            txFrom.textContent = formatAddress(transaction.feePayer);

            // Khôi phục transaction để lấy thông tin người nhận
            const rawTransaction = Transaction.from(Buffer.from(transaction.serialized, 'base64'));
            console.log('Deserialized transaction:', rawTransaction);

            // Lấy instruction chuyển SOL
            const transferInstruction = rawTransaction.instructions.find(
                inst => inst.programId.toBase58() === SystemProgram.programId.toBase58()
            );

            if (transferInstruction) {
                // Lấy địa chỉ người nhận từ instruction
                const recipientPubkey = transferInstruction.keys[1].pubkey;
                const recipientAddress = recipientPubkey.toBase58();
                console.log('Recipient address:', recipientAddress);
                
                txTo.textContent = formatAddress(recipientAddress);

                // Parse số lượng SOL
                const dataBuffer = transferInstruction.data;
                const lamports = dataBuffer.readBigUInt64LE(4);
                const amount = Number(lamports) / LAMPORTS_PER_SOL;
                txAmount.textContent = `${amount.toFixed(9)} SOL`;
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
        walletBalance.textContent = `${balanceInSOL.toFixed(4)} SOL`;
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
