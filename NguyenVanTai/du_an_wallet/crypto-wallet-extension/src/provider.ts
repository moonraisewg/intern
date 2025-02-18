import { Buffer } from 'buffer';
import { Transaction, PublicKey } from '@solana/web3.js';

// Polyfill cho Buffer
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

interface SignTransactionResponse {
  type: string;
  approved: boolean;
  signedTx?: string;
  error?: string;
}

class SolanaProvider {
  private _publicKey: string | null = null;
  private _isConnected: boolean = false;
  
  // Thêm các thuộc tính bắt buộc
  readonly isPhantom: boolean = false;
  readonly isSolanaWallet: boolean = true;

  constructor() {
    // Lắng nghe message từ content script
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  get publicKey(): PublicKey | null {
    return this._publicKey ? new PublicKey(this._publicKey) : null;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  private async handleMessage(event: MessageEvent) {
    if (event.data.type === 'SOL_CONNECT_RESPONSE') {
      console.log('Provider received connect response:', event.data);
      this._isConnected = event.data.approved;
      this._publicKey = event.data.publicKey;
    }
  }

  async connect(): Promise<{ publicKey: PublicKey }> {
    return new Promise((resolve, reject) => {
      const handler = (event: MessageEvent) => {
        if (event.data.type === 'SOL_CONNECT_RESPONSE') {
          window.removeEventListener('message', handler);
          console.log('Connect response in provider:', event.data);
          
          if (event.data.approved && event.data.publicKey) {
            this._isConnected = true;
            this._publicKey = event.data.publicKey;
            resolve({ publicKey: new PublicKey(event.data.publicKey) });
          } else {
            reject(new Error(event.data.error || 'Connection rejected'));
          }
        }
      };

      window.addEventListener('message', handler);
      window.postMessage({ 
        type: 'SOL_CONNECT_REQUEST'
      }, '*');
    });
  }

  async disconnect(): Promise<void> {
    this._isConnected = false;
    this._publicKey = null;
    return Promise.resolve();
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this._isConnected) {
      throw new Error('Ví chưa được kết nối');
    }

    try {
      console.log('Giao dịch gốc:', transaction);

      // Chuẩn bị dữ liệu transaction
      const transactionData = {
        serialized: Buffer.from(transaction.serialize({requireAllSignatures: false})).toString('base64'),
        recentBlockhash: transaction.recentBlockhash,
        feePayer: transaction.feePayer?.toBase58(),
        instructions: transaction.instructions.map(inst => ({
          programId: inst.programId.toBase58(),
          keys: inst.keys,
          data: Buffer.from(inst.data).toString('base64')
        }))
      };

      // Gửi request
      window.postMessage({
        type: 'SOL_SIGN_TRANSACTION_REQUEST',
        transaction: transactionData
      }, '*');

      // Đợi response
      const response = await new Promise<SignTransactionResponse>((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'SOL_SIGN_TRANSACTION_RESPONSE') {
            window.removeEventListener('message', handleMessage);
            if (event.data.error) {
              reject(new Error(event.data.error));
            } else {
              resolve(event.data as SignTransactionResponse);
            }
          }
        };
        window.addEventListener('message', handleMessage);
      });

      // Xử lý response
      if (!response.signedTx) {
        throw new Error('Không nhận được transaction đã ký');
      }

      // Khôi phục transaction đã ký
      return Transaction.from(Buffer.from(response.signedTx, 'base64'));

    } catch (error) {
      console.error('Lỗi trong signTransaction:', error);
      throw error;
    }
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (!this._isConnected) {
      throw new Error('Wallet not connected');
    }

    return Promise.all(transactions.map(transaction => this.signTransaction(transaction)));
  }

  async signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }> {
    if (!this._isConnected) {
      throw new Error('Wallet not connected');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        window.removeEventListener('message', handler);
        reject(new Error('Sign message request timeout'));
      }, 30000);

      const handler = (event: MessageEvent) => {
        if (event.data.type === 'SOL_SIGN_MESSAGE_RESPONSE') {
          clearTimeout(timeoutId);
          window.removeEventListener('message', handler);
          
          if (event.data.approved && event.data.signature) {
            resolve({
              signature: new Uint8Array(event.data.signature)
            });
          } else {
            reject(new Error(event.data.error || 'Message signing rejected'));
          }
        }
      };

      window.addEventListener('message', handler);
      window.postMessage({
        type: 'SOL_SIGN_MESSAGE_REQUEST',
        message: Array.from(message)
      }, '*');
    });
  }
}

// Khởi tạo provider và gắn vào window
window.solana = new SolanaProvider(); 