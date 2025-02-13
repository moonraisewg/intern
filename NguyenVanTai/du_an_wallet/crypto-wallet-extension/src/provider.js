(() => {
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

    async signMessage(message) {
      return new Promise((resolve, reject) => {
        window.postMessage({ 
          type: 'SOL_SIGN_MESSAGE_REQUEST', 
          message: Array.from(message)
        }, '*');

        window.addEventListener('message', function handler(event) {
          if (event.data.type === 'SOL_SIGN_MESSAGE_RESPONSE') {
            window.removeEventListener('message', handler);
            if (event.data.approved) {
              resolve({ signature: new Uint8Array(event.data.signature) });
            } else {
              reject(new Error('User rejected message signing'));
            }
          }
        });
      });
    }
  };
})();

window.dispatchEvent(new Event('solana#initialized')); 