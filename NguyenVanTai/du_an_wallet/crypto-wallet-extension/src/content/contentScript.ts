import { PublicKey, Transaction } from '@solana/web3.js';

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
}

// Định nghĩa interface cho message
interface WalletMessage {
  type: string;
  origin?: string;
  transaction?: any;
  message?: any;
  id?: string;
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

// Lắng nghe message từ trang web
window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  switch (event.data.type) {
    case 'SOL_CONNECT_REQUEST':
      console.log('Received SOL_CONNECT_REQUEST from provider');
      // Sử dụng Promise.race để thêm timeout
      Promise.race<WalletResponse>([
        new Promise<WalletResponse>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 30000)
        ),
        new Promise<WalletResponse>((resolve, reject) => {
          try {
            chrome.runtime.sendMessage({
              type: 'CONNECT_REQUEST',
              origin: window.location.origin
            } as WalletMessage, (response: WalletResponse) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
              }
              resolve(response || {
                type: 'SOL_CONNECT_RESPONSE',
                approved: false,
                error: 'Invalid response'
              });
            });
          } catch (error) {
            reject(error);
          }
        })
      ]).then((response: WalletResponse) => {
        console.log('Got response from background:', response);
        window.postMessage({
          type: 'SOL_CONNECT_RESPONSE',
          approved: response?.approved || false,
          publicKey: response?.publicKey,
          error: response?.error
        } as WalletResponse, '*');
      }).catch(error => {
        console.error('Connection error:', error);
        window.postMessage({
          type: 'SOL_CONNECT_RESPONSE',
          approved: false,
          error: error.message || 'Connection failed'
        } as WalletResponse, '*');
      });
      break;

    case 'SOL_SIGN_TRANSACTION_REQUEST':
      // Sử dụng Promise cho sign transaction
      sendMessageToBackground({
        type: 'SIGN_TRANSACTION',
        transaction: event.data.transaction,
        origin: window.location.origin
      }).then(response => {
        window.postMessage({
          type: 'SOL_SIGN_TRANSACTION_RESPONSE',
          approved: response.approved,
          signedTx: response.signedTx
        }, '*');
      }).catch(error => {
        console.error('Sign transaction error:', error);
        window.postMessage({
          type: 'SOL_SIGN_TRANSACTION_RESPONSE',
          approved: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, '*');
      });
      break;

    case 'SOL_SIGN_MESSAGE_REQUEST':
      console.log('Received sign message request:', event.data);
      Promise.race<WalletResponse>([
        new Promise<WalletResponse>((_, reject) => 
          setTimeout(() => {
            console.log('Sign message timeout');
            reject(new Error('Sign message timeout'));
          }, 15000) 
        ),
        new Promise<WalletResponse>((resolve, reject) => {
          try {
            chrome.runtime.sendMessage({
              type: 'SIGN_MESSAGE',
              message: event.data.message,
              origin: window.location.origin
            } as WalletMessage, (response: WalletResponse) => {
              console.log('Got sign message response:', response);
              if (chrome.runtime.lastError) {
                console.error('Chrome runtime error:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
                return;
              }
              resolve(response || {
                type: 'SOL_SIGN_MESSAGE_RESPONSE',
                approved: false,
                error: 'Invalid response'
              });
            });
          } catch (error) {
            console.error('Error sending sign message request:', error);
            reject(error);
          }
        })
      ]).then((response: WalletResponse) => {
        console.log('Forwarding sign message response:', response);
        window.postMessage({
          type: 'SOL_SIGN_MESSAGE_RESPONSE',
          approved: response.approved,
          signature: response.signature,
          error: response.error
        } as WalletResponse, '*');
      }).catch(error => {
        console.error('Sign message error:', error);
        window.postMessage({
          type: 'SOL_SIGN_MESSAGE_RESPONSE',
          approved: false,
          error: error.message || 'Signing failed'
        } as WalletResponse, '*');
      });
      break;
  }
});

// Lắng nghe message từ background
chrome.runtime.onMessage.addListener((message: WalletResponse, sender, sendResponse) => {
  try {
    console.log('Content script received message:', message);
    
    if (message.type === 'CONNECTION_RESPONSE') {
      console.log('Forwarding CONNECTION_RESPONSE to provider:', message);
      if (!message.publicKey) {
        console.error('No publicKey in CONNECTION_RESPONSE');
      }
      window.postMessage({
        type: 'SOL_CONNECT_RESPONSE',
        approved: message.approved,
        publicKey: message.publicKey,
        error: message.error || (!message.publicKey && message.approved ? 'No public key received' : undefined)
      } as WalletResponse, '*');
    }
    sendResponse(); // Gửi response ngay lập tức
  } catch (error) {
    console.error('Error handling message:', error);
  }
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
