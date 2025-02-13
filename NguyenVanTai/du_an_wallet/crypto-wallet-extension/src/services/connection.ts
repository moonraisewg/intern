import { WalletService } from './wallet';

export class ConnectionService {
  private connectedSites: string[] = [];
  private popupWindow: chrome.windows.Window | null = null;

  async handleConnectionRequest(origin: string): Promise<{approved: boolean, publicKey?: string}> {
    // Kiểm tra nếu đã có popup đang mở thì đóng lại
    if (this.popupWindow) {
      try {
        await chrome.windows.remove(this.popupWindow.id!);
      } catch (error) {
        console.log('Window already closed');
      }
      this.popupWindow = null;
    }

    const approved = await this.showConnectionConfirmation(origin);
    
    if (approved) {
      // Lấy public key từ WalletService
      const walletService = new WalletService();
      const publicKey = await walletService.getAddress();
      
      // Chỉ trả về publicKey nếu nó không null
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
    const data = await chrome.storage.local.get(['connectedSites']);
    return data.connectedSites || [];
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
      // Lấy thông tin về cửa sổ hiện tại
      chrome.windows.getCurrent(async (currentWindow) => {
        // Tính toán vị trí cho popup
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

        // Mở popup xác nhận kết nối
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

      // Lắng nghe response từ popup
      const listener = (message: any) => {
        if (message.type === 'CONNECTION_RESPONSE') {
          chrome.runtime.onMessage.removeListener(listener);
          if (this.popupWindow) {
            chrome.windows.remove(this.popupWindow.id!);
            this.popupWindow = null;
          }
          resolve(message.approved);
        }
      };

      chrome.runtime.onMessage.addListener(listener);
    });
  }
}