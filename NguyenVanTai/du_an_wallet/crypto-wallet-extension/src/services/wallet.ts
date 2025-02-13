import * as web3 from '@solana/web3.js';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import * as nacl from 'tweetnacl';

export class WalletService {
  private keypair: web3.Keypair | null = null;
  private connection: web3.Connection;
  
  constructor() {
    // Kết nối đến Solana devnet
    this.connection = new web3.Connection(web3.clusterApiUrl('devnet'));
  }

  async createWallet(): Promise<{address: string, seedPhrase: string}> {
    try {
      // Tạo seed phrase mới (12 từ)
      const seedPhrase = this.generateMnemonic();
      
      // Tạo keypair từ seed phrase
      const seed = bip39.mnemonicToSeedSync(seedPhrase);
      this.keypair = web3.Keypair.fromSeed(seed.slice(0, 32));
      
      const address = this.keypair.publicKey.toString();
      
      // Lưu private key vào storage
      await chrome.storage.local.set({
        secretKey: Array.from(this.keypair.secretKey),
        publicKey: address
      });
      
      return {
        address,
        seedPhrase
      };
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  // Tạo seed phrase ngẫu nhiên
  private generateMnemonic(): string {
    const entropy = new Uint8Array(16); // 16 bytes = 12 words
    crypto.getRandomValues(entropy);
    return bip39.entropyToMnemonic(entropy, wordlist);
  }

  async getAddress(): Promise<string | null> {
    try {
      const data = await chrome.storage.local.get(['publicKey']);
      console.log('Retrieved address from storage:', data.publicKey); // Debug log
      return data.publicKey || null;
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  }

  async signTransaction(transaction: web3.Transaction): Promise<string> {
    if (!this.keypair) {
      const data = await chrome.storage.local.get(['secretKey']);
      if (!data.secretKey) {
        throw new Error('No wallet found');
      }
      // Khôi phục keypair từ secret key đã lưu
      this.keypair = web3.Keypair.fromSecretKey(
        Uint8Array.from(data.secretKey)
      );
    }
    
    transaction.feePayer = this.keypair.publicKey;
    transaction.recentBlockhash = (
      await this.connection.getLatestBlockhash()
    ).blockhash;
    
    // Ký giao dịch
    transaction.sign(this.keypair);
    const serializedTx = transaction.serialize().toString('base64');
    return serializedTx;
  }

  async getBalance(): Promise<number> {
    if (!this.keypair) {
      const address = await this.getAddress();
      if (!address) throw new Error('No wallet found');
      return await this.connection.getBalance(new web3.PublicKey(address));
    }
    return await this.connection.getBalance(this.keypair.publicKey);
  }

  async setNetwork(network: string): Promise<void> {
    this.connection = new web3.Connection(web3.clusterApiUrl(network as web3.Cluster));
    await chrome.storage.local.set({ network });
  }

  async logout(): Promise<void> {
    // Xóa tất cả dữ liệu ví
    await chrome.storage.local.clear();
    this.keypair = null;
  }

  async getSeedPhrase(): Promise<string | null> {
    const data = await chrome.storage.local.get(['seedPhrase']);
    return data.seedPhrase || null;
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this.keypair) {
      throw new Error('No wallet found');
    }
    
    // Sử dụng nacl để ký message
    return nacl.sign.detached(
      message,
      this.keypair.secretKey
    );
  }
}