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
  error?: string | null;
}

// Khởi tạo service worker
const walletService = new WalletService();
const connectionService = new ConnectionService();

// Lắng nghe message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  if (message.type === 'CONNECT_REQUEST') {
    // Xử lý đồng bộ
    handleConnectRequest(message, sender)
      .then(response => {
        try {
          sendResponse(response);
        } catch (error) {
          console.error('Error sending response:', error);
        }
      })
      .catch(error => {
        console.error('Error handling connect request:', error);
        sendResponse({
          approved: false,
          error: error.message || 'Connection failed'
        });
      });
    return true; // Giữ kênh message mở
  }

  if (message.type === 'CONNECTION_RESPONSE') {
    // Xử lý đồng bộ
    try {
      const tabs = chrome.tabs.query({});
      tabs.then(foundTabs => {
        foundTabs.forEach(tab => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, message);
          }
        });
      });
    } catch (error) {
      console.error('Error broadcasting response:', error);
    }
  }

  return false;
});

// Hàm xử lý yêu cầu kết nối
async function handleConnectRequest(message: any, sender: chrome.runtime.MessageSender): Promise<WalletResponse> {
  try {
    // Kiểm tra ví đã tồn tại chưa
    const address = await walletService.getAddress();
    if (!address) {
      return {
        approved: false,
        error: 'Wallet not found. Please create or import a wallet first.'
      };
    }

    const response = await connectionService.handleConnectionRequest(message.origin);
    if (response.approved) {
      await connectionService.addConnectedSite(message.origin);
      response.publicKey = address;
    }
    console.log('Sending connect response:', response);
    return response;
  } catch (error) {
    console.error('Connect request error:', error);
    return {
      approved: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Hàm xử lý response kết nối
async function handleConnectionResponse(message: any, sender: chrome.runtime.MessageSender) {
  try {
    if (sender.tab?.id) {
      const address = await walletService.getAddress();
      chrome.tabs.sendMessage(sender.tab.id, {
        type: 'CONNECTION_RESPONSE',
        approved: message.approved,
        publicKey: address,
        error: null
      });
    }
  } catch (error) {
    console.error('Connection response error:', error);
    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, {
        type: 'CONNECTION_RESPONSE',
        approved: false,
        publicKey: null,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

// Thông báo service worker đã sẵn sàng
console.log('Service Worker Initialized');
