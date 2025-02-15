import { WalletService } from '../services/wallet';
import { ConnectionService } from '../services/connection';

export function setupEventHandlers() {
    const walletService = WalletService.getInstance();
    const connectionService = ConnectionService.getInstance();

    const logoutBtn = document.getElementById('logout-btn');
    const logoutConfirmModal = document.getElementById('logout-confirm-modal');
    const cancelLogoutBtn = document.getElementById('cancel-logout');
    const confirmLogoutBtn = document.getElementById('confirm-logout');
    const viewSeedPhraseBtn = document.getElementById('view-seed-phrase');
    const seedPhraseModal = document.getElementById('seed-phrase-modal');
    const settingsModal = document.getElementById('settings-modal');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (logoutConfirmModal) {
                logoutConfirmModal.style.display = 'flex';
            }
        });
    }

    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', () => {
            if (logoutConfirmModal) {
                logoutConfirmModal.style.display = 'none';
            }
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', async () => {
            try {
                await walletService.logout();
                if (logoutConfirmModal) {
                    logoutConfirmModal.style.display = 'none';
                }
            } catch (error) {
                console.error('Error logging out:', error);
                alert('Không thể đăng xuất. Vui lòng thử lại.');
            }
        });
    }

    if (viewSeedPhraseBtn) {
        viewSeedPhraseBtn.addEventListener('click', async () => {
            try {
                const seedPhrase = await walletService.getSeedPhrase();
                if (seedPhrase && seedPhraseModal) {
                    const grid = document.querySelector('.seed-phrase-grid');
                    if (grid) {
                        const words = seedPhrase.split(' ');
                        grid.innerHTML = words.map((word: string, index: number) => `
                            <div class="seed-word-container">
                                <span class="seed-word-number">${index + 1}</span>
                                <input type="text" class="seed-word" value="${word}" readonly>
                            </div>
                        `).join('');
                    }
                    if (settingsModal) {
                        settingsModal.style.display = 'none';
                    }
                    seedPhraseModal.style.display = 'flex';
                }
            } catch (error) {
                console.error('Error viewing seed phrase:', error);
                alert('Không thể hiển thị cụm từ khôi phục. Vui lòng thử lại.');
            }
        });
    }

    if (logoutConfirmModal) {
        logoutConfirmModal.style.display = 'none';
    }

    if (settingsModal) {
        settingsModal.style.display = 'none';
    }
} 