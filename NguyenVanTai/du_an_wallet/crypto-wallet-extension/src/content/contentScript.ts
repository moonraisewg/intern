import { PublicKey, Transaction } from '@solana/web3.js';
import { Buffer } from 'buffer';

// Định nghĩa interface cho error
interface WalletError extends Error {
  message: string;
}

// Thêm interface cho response
interface WalletResponse {
  type?: string;
  approved?: boolean;
  publicKey?: string;
  error?: string;
  signedTx?: any;
  signature?: Uint8Array;
  data?: any;
  handled?: boolean;
}

// Định nghĩa interface cho message
interface WalletMessage {
  type: string;
  origin?: string;
  transaction?: any;
  message?: any;
  id?: string;
}

// Định nghĩa interface cho response
interface TransactionResponse {
  type: string;
  approved: boolean;
  signedTx?: any;
  error?: string;
}

// Tạo một ID duy nhất cho mỗi request
let requestId = 0;
function getNextRequestId() {
  return `request_${++requestId}`;
}

// Hàm gửi message đến background script với retry
async function sendMessageToBackground(message: any): Promise<any> {
  const id = getNextRequestId();
  
  return new Promise((resolve, reject) => {
    const listener = (response: any) => {
      if (response.id === id) {
        chrome.runtime.onMessage.removeListener(listener);
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.data);
        }
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    try {
      chrome.runtime.sendMessage({ ...message, id });
    } catch (error) {
      chrome.runtime.onMessage.removeListener(listener);
      reject(error);
    }

    // Timeout sau 30 giây
    setTimeout(() => {
      chrome.runtime.onMessage.removeListener(listener);
      reject(new Error('Request timeout'));
    }, 30000);
  });
}

// Thêm log khi content script được load
console.log('Content script loaded');

// Thêm biến để theo dõi listener
let messageListener: ((event: MessageEvent) => void) | null = null;

// Lắng nghe message từ trang web
window.addEventListener('message', async (event) => {
  if (event.source !== window) return;

  try {
    switch (event.data.type) {
      case 'SOL_CONNECT_REQUEST':
        console.log('Received SOL_CONNECT_REQUEST from provider');
        try {
          const response = await chrome.runtime.sendMessage({
            type: 'CONNECT_REQUEST',
            origin: window.location.origin
          });

          console.log('Got response from background:', response);
          window.postMessage({
            type: 'SOL_CONNECT_RESPONSE',
            approved: response?.approved || false,
            publicKey: response?.publicKey,
            error: response?.error
          }, '*');

        } catch (error) {
          console.error('Connection error:', error);
          window.postMessage({
            type: 'SOL_CONNECT_RESPONSE',
            approved: false,
            error: error instanceof Error ? error.message : 'Connection failed'
          }, '*');
        }
        break;

      case 'SOL_SIGN_TRANSACTION_REQUEST':
        console.log('Forwarding sign transaction request to background', event.data);
        try {
          const response = await chrome.runtime.sendMessage({
            type: 'SIGN_TRANSACTION',
            transaction: event.data.transaction,
            origin: window.location.origin
          });
          
          console.log('Received sign transaction response:', response);
          
          if (response && response.approved && response.signedTx) {
            // Kiểm tra và chuyển đổi transaction
            try {
              const decodedTx = Buffer.from(response.signedTx, 'base64');
              const signedTransaction = Transaction.from(decodedTx);
              console.log('Decoded signed transaction:', signedTransaction);
              
              window.postMessage({
                type: 'SOL_SIGN_TRANSACTION_RESPONSE',
                approved: true,
                signedTx: response.signedTx
              }, '*');
            } catch (error) {
              console.error('Error decoding transaction:', error);
              throw new Error('Failed to decode signed transaction');
            }
          } else {
            throw new Error(response.error || 'Transaction signing failed');
          }
        } catch (error) {
          console.error('Transaction signing failed:', error);
          window.postMessage({
            type: 'SOL_SIGN_TRANSACTION_RESPONSE',
            approved: false,
            error: error instanceof Error ? error.message : 'Transaction signing failed'
          }, '*');
        }
        break;

      case 'SOL_SIGN_MESSAGE_REQUEST':
        try {
          console.log('Forwarding sign message request to background');
          const response = await chrome.runtime.sendMessage({
            type: 'SIGN_MESSAGE',
            message: event.data.message,
            origin: window.location.origin
          });

          console.log('Received sign message response from background:', response);
          
          // Đảm bảo response được gửi ngay lập tức
          window.postMessage({
            type: 'SOL_SIGN_MESSAGE_RESPONSE',
            approved: response.approved,
            signature: response.signature,
            error: response.error
          }, '*');

        } catch (error) {
          console.error('Message signing failed:', error);
          window.postMessage({
            type: 'SOL_SIGN_MESSAGE_RESPONSE',
            approved: false,
            error: error instanceof Error ? error.message : 'Failed to sign message'
          }, '*');
        }
        break;
    }
  } catch (error) {
    console.error('Error in content script:', error);
    window.postMessage({
      type: 'SOL_SIGN_TRANSACTION_RESPONSE',
      approved: false,
      error: error instanceof Error ? error.message : 'Transaction signing failed'
    }, '*');
  }
});

// Lắng nghe message từ background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message from background:', message);
  
  if (message.type === 'SIGN_TRANSACTION_RESPONSE') {
    window.postMessage({
      type: 'SOL_SIGN_TRANSACTION_RESPONSE',
      approved: message.approved,
      signedTx: message.signedTx,
      error: message.error
    }, '*');
  }
  
  // Gửi response ngay lập tức
  sendResponse({ received: true });
  return false;
});

// Inject provider script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('provider.js');
(document.head || document.documentElement).appendChild(script);

// Thông báo provider đã sẵn sàng
script.onload = () => {
  script.remove();
  window.dispatchEvent(new Event('solana#initialized'));
};

// Thêm polyfill cho Buffer
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || require('buffer').Buffer;
}
