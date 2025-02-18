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

// Định nghĩa interface cho popup response
interface PopupResponse {
  type: string;
  approved: boolean;
  signedTx?: string;
  error?: string;
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
  timestamp?: number;
  sendResponse: (response: any) => void;
}>();

// Thêm hàm kiểm tra tab tồn tại
async function isTabActive(tabId: number): Promise<boolean> {
  try {
    const tab = await chrome.tabs.get(tabId);
    return tab && !tab.discarded;
  } catch {
    return false;
  }
}

// Lắng nghe message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  if (message.type === 'CONNECT_REQUEST') {
    handleConnectRequest(message, sender)
      .then(response => {
        try {
          if (!chrome.runtime.lastError) {
            sendResponse(response);
          }
        } catch (error) {
          console.error('Error sending response:', error);
        }
      })
      .catch(error => {
        console.error('Error handling connect request:', error);
        try {
          if (!chrome.runtime.lastError) {
            sendResponse({
              approved: false,
              error: error.message || 'Connection failed'
            });
          }
        } catch (err) {
          console.error('Error sending error response:', err);
        }
      });
    return true;
  }

  if (message.type === 'CONNECTION_RESPONSE') {
    handleConnectionResponse(message).catch(console.error);
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
        try {
          console.log('Processing sign message response:', message);
          if (!chrome.runtime.lastError) {
            pendingRequest.sendResponse({
              approved: message.approved,
              signature: message.signature,
              error: message.error
            });
          }
          pendingRequests.delete(popup);
        } catch (error) {
          console.error('Error sending sign message response:', error);
        }
      }
    }
    return false;
  }

  if (message.type === 'SIGN_TRANSACTION') {
    let popupId: number | null = null;

    // Mở popup để xác nhận transaction
    chrome.windows.create({
      url: 'popup.html',
      type: 'popup',
      width: 400,
      height: 600
    }, async (popupWindow) => {
      try {
        if (!popupWindow?.id) {
          throw new Error('Failed to create popup window');
        }

        popupId = popupWindow.id;

        // Lưu thông tin transaction
        await chrome.storage.local.set({
          pendingTransaction: message.transaction,
          transactionOrigin: message.origin
        });

        // Chỉ gửi response một lần khi nhận được kết quả từ popup
        const handlePopupMessage = async (response: PopupResponse) => {
          if (response.type === 'SIGN_TRANSACTION_RESPONSE') {
            // Gửi response về content script
            if (sender.tab?.id) {
              await chrome.tabs.sendMessage(sender.tab.id, {
                type: 'SIGN_TRANSACTION_RESPONSE',
                approved: response.approved,
                signedTx: response.signedTx,
                error: response.error
              });
            }

            // Xóa dữ liệu và đóng popup
            await chrome.storage.local.remove(['pendingTransaction', 'transactionOrigin']);
            if (popupId) {
              await chrome.windows.remove(popupId);
            }

            // Xóa listener
            chrome.runtime.onMessage.removeListener(handlePopupMessage);
          }
        };

        chrome.runtime.onMessage.addListener(handlePopupMessage);

      } catch (error: unknown) {
        console.error('Error in background:', error);
        if (sender.tab?.id) {
          chrome.tabs.sendMessage(sender.tab.id, {
            type: 'SIGN_TRANSACTION_RESPONSE',
            approved: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    });

    return true; // Giữ kết nối cho async response
  }

  return true;
});

// Lắng nghe khi popup được mở
chrome.runtime.onConnect.addListener((port) => {
  console.log('Popup connected');
  
  if (port.name === 'popup') {
    port.onMessage.addListener((msg) => {
      if (msg.type === 'POPUP_READY') {
        // Gửi transaction data cho popup
        chrome.storage.local.get(['pendingTransaction', 'transactionOrigin'], (data) => {
          if (data.pendingTransaction && data.transactionOrigin) {
            port.postMessage({
              type: 'SHOW_TRANSACTION',
              transaction: data.pendingTransaction,
              origin: data.transactionOrigin
            });
          }
        });
      }
    });
  }
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
async function handleConnectionResponse(message: any) {
  try {
    // Lấy tất cả các tab
    const tabs = await chrome.tabs.query({});
    
    // Gửi response đến từng tab một cách an toàn
    for (const tab of tabs) {
      if (tab.id && await isTabActive(tab.id)) {
        try {
          await chrome.tabs.sendMessage(tab.id, message);
        } catch (error) {
          console.log(`Failed to send message to tab ${tab.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error broadcasting response:', error);
  }
}

// Thông báo service worker đã sẵn sàng
console.log('Service Worker Initialized');
