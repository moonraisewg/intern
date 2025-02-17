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
// Thêm log khi content script được load
console.log('Content script loaded');
// Thêm biến để theo dõi listener
let messageListener = null;
// Lắng nghe message từ trang web
window.addEventListener('message', (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('Content script received message:', event.data);
    if (event.source !== window)
        return;
    switch (event.data.type) {
        case 'SOL_CONNECT_REQUEST':
            console.log('Received SOL_CONNECT_REQUEST from provider');
            // Sử dụng Promise.race để thêm timeout
            Promise.race([
                new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 30000)),
                new Promise((resolve, reject) => {
                    try {
                        chrome.runtime.sendMessage({
                            type: 'CONNECT_REQUEST',
                            origin: window.location.origin
                        }, (response) => {
                            if (chrome.runtime.lastError) {
                                reject(chrome.runtime.lastError);
                                return;
                            }
                            resolve(response || {
                                type: 'SOL_CONNECT_RESPONSE',
                                approved: false,
                                error: 'Invalid response'
                            });
                        });
                    }
                    catch (error) {
                        reject(error);
                    }
                })
            ]).then((response) => {
                console.log('Got response from background:', response);
                window.postMessage({
                    type: 'SOL_CONNECT_RESPONSE',
                    approved: (response === null || response === void 0 ? void 0 : response.approved) || false,
                    publicKey: response === null || response === void 0 ? void 0 : response.publicKey,
                    error: response === null || response === void 0 ? void 0 : response.error
                }, '*');
            }).catch(error => {
                console.error('Connection error:', error);
                window.postMessage({
                    type: 'SOL_CONNECT_RESPONSE',
                    approved: false,
                    error: error.message || 'Connection failed'
                }, '*');
            });
            break;
        case 'SOL_SIGN_TRANSACTION_REQUEST':
            // Sử dụng Promise cho sign transaction
            sendMessageToBackground({
                type: 'SIGN_TRANSACTION',
                transaction: event.data.transaction,
                origin: window.location.origin
            }).then(response => {
                window.postMessage({
                    type: 'SOL_SIGN_TRANSACTION_RESPONSE',
                    approved: response.approved,
                    signedTx: response.signedTx
                }, '*');
            }).catch(error => {
                console.error('Sign transaction error:', error);
                window.postMessage({
                    type: 'SOL_SIGN_TRANSACTION_RESPONSE',
                    approved: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }, '*');
            });
            break;
        case 'SOL_SIGN_MESSAGE_REQUEST':
            console.log('Received sign message request:', event.data);
            let isResponseReceived = false;
            let timeoutId;
            try {
                if (!((_a = chrome === null || chrome === void 0 ? void 0 : chrome.runtime) === null || _a === void 0 ? void 0 : _a.id)) {
                    throw new Error('Extension context invalidated');
                }
                const messagePromise = new Promise((resolve, reject) => {
                    timeoutId = setTimeout(() => {
                        if (!isResponseReceived) {
                            console.log('Sign message timeout - cleaning up');
                            reject(new Error('Sign message timeout'));
                        }
                    }, 15000); // Giảm xuống 15 giây
                    chrome.runtime.sendMessage({
                        type: 'SIGN_MESSAGE',
                        message: event.data.message,
                        origin: window.location.origin
                    }, (response) => {
                        isResponseReceived = true;
                        if (timeoutId)
                            clearTimeout(timeoutId);
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                            return;
                        }
                        resolve(response);
                    });
                });
                const response = yield messagePromise;
                console.log('Got sign message response:', response);
                window.postMessage({
                    type: 'SOL_SIGN_MESSAGE_RESPONSE',
                    approved: response.approved,
                    signature: response.signature,
                    error: response.error
                }, '*');
            }
            catch (error) {
                console.error('Message sending failed:', error);
                window.postMessage({
                    type: 'SOL_SIGN_MESSAGE_RESPONSE',
                    approved: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }, '*');
            }
            finally {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            }
            break;
    }
}));
// Lắng nghe message từ background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        console.log('Content script received message:', message);
        if (message.type === 'CONNECTION_RESPONSE') {
            console.log('Forwarding CONNECTION_RESPONSE to provider:', message);
            if (!message.publicKey) {
                console.error('No publicKey in CONNECTION_RESPONSE');
            }
            window.postMessage({
                type: 'SOL_CONNECT_RESPONSE',
                approved: message.approved,
                publicKey: message.publicKey,
                error: message.error || (!message.publicKey && message.approved ? 'No public key received' : undefined)
            }, '*');
        }
        sendResponse(); // Gửi response ngay lập tức
    }
    catch (error) {
        console.error('Error handling message:', error);
    }
});
// Inject provider script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('provider.js');
(document.head || document.documentElement).appendChild(script);
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