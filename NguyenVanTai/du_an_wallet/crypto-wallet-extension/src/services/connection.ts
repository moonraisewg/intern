import { WalletService } from './wallet';
import * as web3 from '@solana/web3.js';

export class ConnectionService {
  private static instance: ConnectionService;
  private connection: web3.Connection;

  private constructor() {
    this.handleConnectionRequest = this.handleConnectionRequest.bind(this);
    this.isConnected = this.isConnected.bind(this);
    // Khởi tạo connection với mạng devnet
    this.connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
  }

  public static getInstance(): ConnectionService {
    if (!ConnectionService.instance) {
      ConnectionService.instance = new ConnectionService();
    }
    return ConnectionService.instance;
  }

  connectedSites: string[] = [];
  popupWindow: chrome.windows.Window | null = null;

  async handleConnectionRequest(origin: string): Promise<{approved: boolean, publicKey?: string}> {
    if (this.popupWindow?.id !== undefined) {
      try {
        await chrome.windows.remove(this.popupWindow.id);
      } catch (error) {
        console.log('Window already closed');
      }
      this.popupWindow = null;
    }

    const approved = await this.showConnectionConfirmation(origin);
    if (approved) {
      const walletService = WalletService.getInstance();
      const publicKey = await walletService.getAddress();
      if (publicKey) {
        return { approved: true, publicKey };
      }
      return { approved: true };
    }
    return { approved: false };
  }

  async isConnected(origin: string): Promise<boolean> {
    const sites = await this.getConnectedSites();
    return sites.includes(origin);
  }

  async getConnectedSites(): Promise<string[]> {
    const result = await chrome.storage.local.get('connectedSites');
    return result.connectedSites || [];
  }

  async addConnectedSite(origin: string): Promise<void> {
    const sites = await this.getConnectedSites();
    if (!sites.includes(origin)) {
      sites.push(origin);
      await chrome.storage.local.set({ connectedSites: sites });
    }
  }

  async removeConnectedSite(origin: string): Promise<void> {
    const sites = await this.getConnectedSites();
    const updatedSites = sites.filter(site => site !== origin);
    await chrome.storage.local.set({ connectedSites: updatedSites });
  }

  private async showConnectionConfirmation(origin: string): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.windows.getCurrent(async (currentWindow) => {
        const width = 375;
        const height = 600;
        const left = Math.max(
          ((currentWindow.width || 1024) - width) / 2 + (currentWindow.left || 0),
          0
        );
        const top = Math.max(
          ((currentWindow.height || 768) - height) / 2 + (currentWindow.top || 0),
          0
        );

        const popup = await chrome.windows.create({
          url: chrome.runtime.getURL(`popup.html#connect?origin=${encodeURIComponent(origin)}`),
          type: 'popup',
          width,
          height,
          left: Math.round(left),
          top: Math.round(top),
          focused: true
        });

        this.popupWindow = popup;
      });

      const listener = (message: any) => {
        if (message.type === 'CONNECTION_RESPONSE') {
          chrome.runtime.onMessage.removeListener(listener);
          if (this.popupWindow?.id !== undefined) {
            chrome.windows.remove(this.popupWindow.id);
            this.popupWindow = null;
          }
          resolve(message.approved);
        }
      };
      chrome.runtime.onMessage.addListener(listener);
    });
  }

  async getLatestBlockhash(): Promise<{ blockhash: string }> {
    try {
      const { blockhash } = await this.connection.getLatestBlockhash();
      return { blockhash };
    } catch (error) {
      console.error('Error getting latest blockhash:', error);
      throw error;
    }
  }

  async getBalance(address: string): Promise<number> {
    try {
      const publicKey = new web3.PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  // Thêm phương thức để thay đổi mạng
  setNetwork(network: web3.Cluster) {
    this.connection = new web3.Connection(web3.clusterApiUrl(network), 'confirmed');
  }
}