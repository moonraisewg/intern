import { PublicKey, Transaction } from '@solana/web3.js';

// Định nghĩa interface cho error
interface WalletError extends Error {
  message: string;
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

// Inject provider script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('provider.js');
(document.head || document.documentElement).appendChild(script);

// Lắng nghe message từ background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'CONNECTION_RESPONSE') {
    window.postMessage({
      type: 'SOL_CONNECT_RESPONSE',
      approved: message.approved,
      publicKey: message.publicKey
    }, '*');
  }
});

// Lắng nghe message từ trang web
window.addEventListener('message', async (event) => {
  if (event.source !== window) return;

  switch (event.data.type) {
    case 'SOL_CONNECT_REQUEST':
      try {
        const response = await sendMessageToBackground({
          type: 'CONNECT_REQUEST',
          origin: window.location.origin
        });
        
        // Response sẽ được xử lý bởi listener ở trên
      } catch (error: unknown) {
        console.error('Connection error:', error);
        window.postMessage({
          type: 'SOL_CONNECT_RESPONSE',
          approved: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, '*');
      }
      break;

    case 'SOL_SIGN_TRANSACTION_REQUEST':
      try {
        const response = await sendMessageToBackground({
          type: 'SIGN_TRANSACTION',
          transaction: event.data.transaction,
          origin: window.location.origin
        });
        window.postMessage({
          type: 'SOL_SIGN_TRANSACTION_RESPONSE',
          approved: response.approved,
          signedTx: response.signedTx
        }, '*');
      } catch (error: unknown) {
        console.error('Sign transaction error:', error);
        window.postMessage({
          type: 'SOL_SIGN_TRANSACTION_RESPONSE',
          approved: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, '*');
      }
      break;

    case 'SOL_SIGN_MESSAGE_REQUEST':
      try {
        const response = await sendMessageToBackground({
          type: 'SIGN_MESSAGE',
          message: event.data.message,
          origin: window.location.origin
        });
        window.postMessage({
          type: 'SOL_SIGN_MESSAGE_RESPONSE',
          approved: response.approved,
          signature: response.signature
        }, '*');
      } catch (error: unknown) {
        console.error('Sign message error:', error);
        window.postMessage({
          type: 'SOL_SIGN_MESSAGE_RESPONSE',
          approved: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, '*');
      }
      break;
  }
});

// Thông báo provider đã sẵn sàng
script.onload = () => {
  script.remove();
  window.dispatchEvent(new Event('solana#initialized'));
};
