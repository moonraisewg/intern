import * as web3 from '@solana/web3.js';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import * as nacl from 'tweetnacl';
import { ConnectionService } from './connection';
import { Connection } from '@solana/web3.js';

export class WalletService {
  private static instance: WalletService;
  private connection: web3.Connection;
  private connectionService: ConnectionService;

  private constructor() {
    this.connectionService = ConnectionService.getInstance();
    this.connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
  }

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  private keypair: web3.Keypair | null = null;
  
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
      this.keypair = web3.Keypair.fromSecretKey(
        Uint8Array.from(data.secretKey)
      );
    }
    
    transaction.feePayer = this.keypair.publicKey;
    const { blockhash } = await this.connectionService.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    
    transaction.sign(this.keypair);
    return transaction.serialize().toString('base64');
  }

  async getBalance(): Promise<number> {
    try {
      const address = await this.getAddress();
      if (!address) throw new Error('No wallet found');
      
      const publicKey = new web3.PublicKey(address);
      return await this.connectionService.getBalance(address);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
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
    try {
      // Lấy secret key từ storage nếu chưa có keypair
      if (!this.keypair) {
        const data = await chrome.storage.local.get(['secretKey']);
        if (!data.secretKey) {
          throw new Error('No wallet found');
        }
        // Khôi phục keypair từ secret key đã lưu
        this.keypair = web3.Keypair.fromSecretKey(
          new Uint8Array(data.secretKey)
        );
      }

      console.log('Signing message with keypair:', {
        publicKey: this.keypair.publicKey.toString(),
        messageLength: message.length
      });

      // Ký message trực tiếp với Uint8Array
      const signature = nacl.sign.detached(
        message,
        this.keypair.secretKey
      );

      console.log('Message signed successfully:', {
        messageBytes: Array.from(message),
        signatureBytes: Array.from(signature)
      });

      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to sign message'
      );
    }
  }
}