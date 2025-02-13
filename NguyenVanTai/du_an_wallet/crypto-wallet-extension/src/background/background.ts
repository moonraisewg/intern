import { WalletService } from '../services/wallet';
import { ConnectionService } from '../services/connection';

// Định nghĩa interface cho wallet creation response
interface WalletCreationResponse {
  address: string;
  seedPhrase: string;
}

// Định nghĩa interface cho response
interface WalletResponse {
  approved?: boolean;
  publicKey?: string;
  address?: string;
  seedPhrase?: string;
  signedTx?: any;
  signature?: Uint8Array;
  error?: string;
}

// Khởi tạo service worker
const walletService = new WalletService();
const connectionService = new ConnectionService();

// Lắng nghe message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      let response: WalletResponse = {};
      
      switch (message.type) {
        case 'CREATE_WALLET':
          const walletData = await walletService.createWallet() as WalletCreationResponse;
          response = { 
            address: walletData.address,
            seedPhrase: walletData.seedPhrase
          };
          break;
          
        case 'CONNECT_REQUEST':
          response = await connectionService.handleConnectionRequest(message.origin);
          if (response.approved) {
            await connectionService.addConnectedSite(message.origin);
          }
          // Gửi response ngay lập tức
          sendResponse(response);
          break;
          
        case 'CONNECTION_RESPONSE':
          // Broadcast response đến tất cả tabs
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              if (tab.id) {
                chrome.tabs.sendMessage(tab.id, {
                  type: 'CONNECTION_RESPONSE',
                  approved: message.approved,
                  publicKey: response?.publicKey
                });
              }
            });
          });
          break;

        case 'SIGN_TRANSACTION':
          if (await connectionService.isConnected(message.origin)) {
            const signedTx = await walletService.signTransaction(message.transaction);
            response = { approved: true, signedTx };
          } else {
            response = { approved: false, error: 'Not connected' };
          }
          break;

        case 'SIGN_MESSAGE':
          if (await connectionService.isConnected(message.origin)) {
            const signature = await walletService.signMessage(message.message);
            response = { approved: true, signature };
          } else {
            response = { approved: false, error: 'Not connected' };
          }
          break;

        default:
          response = { error: 'Unknown request type' };
      }

      // Gửi response với ID
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          id: message.id,
          data: response
        });
      }

    } catch (error: unknown) {
      console.error('Error in background:', error);
      sendResponse({ 
        approved: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })();
  return true;
});

// Thông báo service worker đã sẵn sàng
console.log('Service Worker Initialized');
