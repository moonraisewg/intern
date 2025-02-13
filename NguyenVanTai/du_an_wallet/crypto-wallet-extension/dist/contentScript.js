/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 88:
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Tạo một ID duy nhất cho mỗi request
let requestId = 0;
function getNextRequestId() {
    return `request_${++requestId}`;
}
// Hàm gửi message đến background script với retry
function sendMessageToBackground(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = getNextRequestId();
        return new Promise((resolve, reject) => {
            const listener = (response) => {
                if (response.id === id) {
                    chrome.runtime.onMessage.removeListener(listener);
                    if (response.error) {
                        reject(new Error(response.error));
                    }
                    else {
                        resolve(response.data);
                    }
                }
            };
            chrome.runtime.onMessage.addListener(listener);
            try {
                chrome.runtime.sendMessage(Object.assign(Object.assign({}, message), { id }));
            }
            catch (error) {
                chrome.runtime.onMessage.removeListener(listener);
                reject(error);
            }
            // Timeout sau 30 giây
            setTimeout(() => {
                chrome.runtime.onMessage.removeListener(listener);
                reject(new Error('Request timeout'));
            }, 30000);
        });
    });
}
// Inject provider script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('provider.js');
(document.head || document.documentElement).appendChild(script);
// Lắng nghe message từ background
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'CONNECTION_RESPONSE') {
        window.postMessage({
            type: 'SOL_CONNECT_RESPONSE',
            approved: message.approved,
            publicKey: message.publicKey
        }, '*');
    }
});
// Lắng nghe message từ trang web
window.addEventListener('message', (event) => __awaiter(void 0, void 0, void 0, function* () {
    if (event.source !== window)
        return;
    switch (event.data.type) {
        case 'SOL_CONNECT_REQUEST':
            try {
                const response = yield sendMessageToBackground({
                    type: 'CONNECT_REQUEST',
                    origin: window.location.origin
                });
                // Response sẽ được xử lý bởi listener ở trên
            }
            catch (error) {
                console.error('Connection error:', error);
                window.postMessage({
                    type: 'SOL_CONNECT_RESPONSE',
                    approved: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }, '*');
            }
            break;
        case 'SOL_SIGN_TRANSACTION_REQUEST':
            try {
                const response = yield sendMessageToBackground({
                    type: 'SIGN_TRANSACTION',
                    transaction: event.data.transaction,
                    origin: window.location.origin
                });
                window.postMessage({
                    type: 'SOL_SIGN_TRANSACTION_RESPONSE',
                    approved: response.approved,
                    signedTx: response.signedTx
                }, '*');
            }
            catch (error) {
                console.error('Sign transaction error:', error);
                window.postMessage({
                    type: 'SOL_SIGN_TRANSACTION_RESPONSE',
                    approved: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }, '*');
            }
            break;
        case 'SOL_SIGN_MESSAGE_REQUEST':
            try {
                const response = yield sendMessageToBackground({
                    type: 'SIGN_MESSAGE',
                    message: event.data.message,
                    origin: window.location.origin
                });
                window.postMessage({
                    type: 'SOL_SIGN_MESSAGE_RESPONSE',
                    approved: response.approved,
                    signature: response.signature
                }, '*');
            }
            catch (error) {
                console.error('Sign message error:', error);
                window.postMessage({
                    type: 'SOL_SIGN_MESSAGE_RESPONSE',
                    approved: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }, '*');
            }
            break;
    }
}));
// Thông báo provider đã sẵn sàng
script.onload = () => {
    script.remove();
    window.dispatchEvent(new Event('solana#initialized'));
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__[88](0, __webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=contentScript.js.map