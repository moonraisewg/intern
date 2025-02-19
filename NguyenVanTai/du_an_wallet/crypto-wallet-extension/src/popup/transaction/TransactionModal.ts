import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TransactionData } from './types';
import { formatAddress, formatAmount } from '../utils/format';
import { handleTransactionSign } from './handlers';

export function showSignTransactionModal(transaction: TransactionData, origin: string) {
    const signTransactionModal = document.getElementById('sign-transaction-modal');
    const txOrigin = document.getElementById('tx-site-origin');
    const txFrom = document.getElementById('tx-from');
    const txTo = document.getElementById('tx-to');
    const txAmount = document.getElementById('tx-amount');
    const approveTransactionBtn = document.getElementById('approve-transaction-btn');
    const rejectTransactionBtn = document.getElementById('reject-transaction-btn');
    
    if (signTransactionModal && txOrigin && txFrom && txTo && txAmount) {
        try {
            console.log('Processing transaction:', transaction);

            // Hiển thị origin và địa chỉ người gửi
            txOrigin.textContent = origin || 'Unknown origin';
            txFrom.textContent = formatAddress(transaction.feePayer);

            // Khôi phục transaction từ dữ liệu serialized
            const rawTransaction = Transaction.from(Buffer.from(transaction.serialized, 'base64'));
            console.log('Deserialized transaction:', rawTransaction);

            // Tìm instruction chuyển SOL
            const transferInstruction = rawTransaction.instructions.find(
                inst => inst.programId.toBase58() === SystemProgram.programId.toBase58()
            );

            if (transferInstruction) {
                // Lấy địa chỉ người nhận
                const recipientPubkey = transferInstruction.keys[1].pubkey;
                const recipientAddress = recipientPubkey.toBase58();
                console.log('Recipient address:', recipientAddress);
                txTo.textContent = formatAddress(recipientAddress);

                // Parse số lượng SOL từ instruction data
                const dataBuffer = transferInstruction.data;
                console.log('Raw instruction data:', Array.from(dataBuffer));

                try {
                    // Đọc lamports trực tiếp từ dataBuffer
                    const rawLamports = dataBuffer.readBigUInt64LE(4);
                    console.log('Giá trị lamports gốc:', rawLamports.toString());
                    
                    // Không cần chuyển đổi lamports ở đây vì formatAmount sẽ làm việc đó
                    txAmount.textContent = formatAmount(Number(rawLamports));
                    
                } catch (error) {
                    console.error('Lỗi đọc số lamports:', error);
                    console.log('Nội dung buffer:', Array.from(dataBuffer));
                    throw new Error('Không thể đọc số tiền giao dịch');
                }
            } else {
                throw new Error('Invalid transfer instruction');
            }

            // Setup event listeners
            setupModalButtons(signTransactionModal, approveTransactionBtn, rejectTransactionBtn);
            signTransactionModal.style.display = 'flex';

        } catch (error) {
            console.error('Error processing transaction:', error);
        }
    }
}

function setupModalButtons(modal: HTMLElement, approveBtn: HTMLElement | null, rejectBtn: HTMLElement | null) {
    approveBtn?.addEventListener('click', async () => {
        try {
            await handleTransactionSign();
            modal.style.display = 'none';
        } catch (error) {
            console.error('Error approving transaction:', error);
        }
    });

    rejectBtn?.addEventListener('click', () => {
        chrome.runtime.sendMessage({
            type: 'SIGN_TRANSACTION_RESPONSE',
            approved: false,
            error: 'User rejected transaction'
        });
        modal.style.display = 'none';
    });
}