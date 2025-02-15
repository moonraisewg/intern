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

// Thành:
const walletService = WalletService.getInstance();
const connectionService = ConnectionService.getInstance();

// Thêm Map để lưu các pending requests
const pendingRequests = new Map<number, {
  type: string;
  origin: string;
  message?: any;
  transaction?: any;
  sendResponse: (response: any) => void;
}>();

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
    handleConnectionResponse(message);
    return false;
  }

  if (message.type === 'SIGN_MESSAGE') {
    handleSignMessageRequest(message, sendResponse);
    return true;
  }

  if (message.type === 'SIGN_MESSAGE_RESPONSE') {
    const popup = sender.tab?.windowId;
    if (typeof popup === 'number') {
      const pendingRequest = pendingRequests.get(popup);
      
      if (pendingRequest) {
        console.log('Processing sign message response:', message);
        pendingRequest.sendResponse({
          approved: message.approved,
          signature: message.signature,
          error: message.error
        });
        pendingRequests.delete(popup);
      } else {
        console.error('No pending request found for popup:', popup);
      }
    } else {
      console.error('Invalid popup window ID');
    }
    return false;
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

// Thêm hàm xử lý sign message request
async function handleSignMessageRequest(message: any, sendResponse: (response: any) => void) {
  try {
    console.log('Processing sign message request:', message);
    
    // Kiểm tra xem site có được kết nối không
    const isConnected = await connectionService.isConnected(message.origin);
    if (!isConnected) {
      console.log('Site not connected:', message.origin);
      sendResponse({
        approved: false,
        error: 'Site not connected. Please connect first.'
      });
      return;
    }

    // Kiểm tra message format và encode
    const messageBytes = message.message;
    if (!messageBytes || !Array.isArray(messageBytes)) {
      console.error('Invalid message format:', message);
      sendResponse({
        approved: false,
        error: 'Invalid message format'
      });
      return;
    }

    // Encode message để truyền qua URL
    const encodedMessage = btoa(String.fromCharCode.apply(null, messageBytes));

    // Mở popup để xác nhận
    const popup = await chrome.windows.create({
      url: `popup.html#sign-message?origin=${encodeURIComponent(message.origin)}&message=${encodedMessage}`,
      type: 'popup',
      width: 375,
      height: 600
    });

    // Lưu thông tin request để xử lý sau
    pendingRequests.set(popup.id!, {
      type: 'SIGN_MESSAGE',
      origin: message.origin,
      message: messageBytes,
      sendResponse
    });

    console.log('Created popup for signing:', popup.id);
  } catch (error) {
    console.error('Error handling sign message request:', error);
    sendResponse({
      approved: false,
      error: error instanceof Error ? error.message : 'Failed to process signing request'
    });
  }
}

// Sửa lại hàm xử lý connection response
function handleConnectionResponse(message: any) {
  try {
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, message);
        }
      });
    });
  } catch (error) {
    console.error('Error broadcasting response:', error);
  }
}

// Thông báo service worker đã sẵn sàng
console.log('Service Worker Initialized');
