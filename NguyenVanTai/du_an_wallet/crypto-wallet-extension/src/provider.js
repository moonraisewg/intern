(() => {
  // Thêm Buffer polyfill
  const Buffer = require('buffer/').Buffer;

  // Thay thế Buffer bằng TextEncoder
  async function signMessage(message) {
    try {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Sign message request timeout'));
        }, 60000); // Tăng timeout lên 60 giây

        const messageBytes = message instanceof Uint8Array 
          ? message 
          : new TextEncoder().encode(typeof message === 'string' ? message : String(message));

        console.log('Signing message:', {
          original: message,
          encoded: messageBytes
        });

        const handleResponse = (event) => {
          if (event.data.type === 'SOL_SIGN_MESSAGE_RESPONSE') {
            clearTimeout(timeoutId);
            window.removeEventListener('message', handleResponse);
            console.log('Received sign response:', event.data);
            
            if (event.data.approved && event.data.signature) {
              resolve({ 
                signature: new Uint8Array(event.data.signature)
              });
            } else {
              reject(new Error(event.data.error || 'User rejected message signing'));
            }
          }
        };

        window.addEventListener('message', handleResponse);

        window.postMessage({ 
          type: 'SOL_SIGN_MESSAGE_REQUEST', 
          message: Array.from(messageBytes)
        }, '*');
      });
    } catch (error) {
      console.error('Sign message error:', error);
      throw error;
    }
  }

  window.solana = {
    isSolanaWallet: true,
    publicKey: null,

    async connect() {
      try {
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Connection request timeout'));
          }, 30000);

          const handleResponse = (event) => {
            if (event.data.type === 'SOL_CONNECT_RESPONSE') {
              clearTimeout(timeoutId);
              console.log('Provider received response:', event.data);
              window.removeEventListener('message', handleResponse);
              
              if (event.data.approved && event.data.publicKey) {
                this.publicKey = event.data.publicKey;
                resolve({ publicKey: event.data.publicKey });
              } else {
                const error = event.data.error || 
                  (!event.data.publicKey ? 'Please create or import a wallet first' : 'User rejected connection');
                reject(new Error(error));
              }
            }
          };

          try {
            window.addEventListener('message', handleResponse);
            console.log('Provider sending connect request');
            window.postMessage({ type: 'SOL_CONNECT_REQUEST' }, '*');
          } catch (error) {
            clearTimeout(timeoutId);
            reject(error);
          }
        });
      } catch (error) {
        console.error('Connect error:', error);
        throw error;
      }
    },

    async disconnect() {
      this.publicKey = null;
    },

    async signTransaction(transaction) {
      return new Promise((resolve, reject) => {
        window.postMessage({ 
          type: 'SOL_SIGN_TRANSACTION_REQUEST', 
          transaction: transaction
        }, '*');

        window.addEventListener('message', function handler(event) {
          if (event.data.type === 'SOL_SIGN_TRANSACTION_RESPONSE') {
            window.removeEventListener('message', handler);
            if (event.data.approved) {
              resolve(event.data.signedTx);
            } else {
              reject(new Error('User rejected transaction'));
            }
          }
        });
      });
    },

    signMessage: signMessage
  };
})();

window.dispatchEvent(new Event('solana#initialized')); 