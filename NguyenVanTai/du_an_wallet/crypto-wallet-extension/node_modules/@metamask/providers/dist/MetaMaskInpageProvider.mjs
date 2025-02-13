var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MetaMaskInpageProvider_networkVersion;
import { rpcErrors } from "@metamask/rpc-errors";
import messages from "./messages.mjs";
import { sendSiteMetadata } from "./siteMetadata.mjs";
import { AbstractStreamProvider } from "./StreamProvider.mjs";
import { EMITTED_NOTIFICATIONS, getDefaultExternalMiddleware, getRpcPromiseCallback, NOOP } from "./utils.mjs";
/**
 * The name of the stream consumed by {@link MetaMaskInpageProvider}.
 */
export const MetaMaskInpageProviderStreamName = 'metamask-provider';
export class MetaMaskInpageProvider extends AbstractStreamProvider {
    /**
     * Creates a new `MetaMaskInpageProvider`.
     *
     * @param connectionStream - A Node.js duplex stream.
     * @param options - An options bag.
     * @param options.logger - The logging API to use. Default: `console`.
     * @param options.maxEventListeners - The maximum number of event
     * listeners. Default: 100.
     * @param options.shouldSendMetadata - Whether the provider should
     * send page metadata. Default: `true`.
     */
    constructor(connectionStream, { logger = console, maxEventListeners = 100, shouldSendMetadata, } = {}) {
        super(connectionStream, {
            logger,
            maxEventListeners,
            rpcMiddleware: getDefaultExternalMiddleware(logger),
        });
        this._sentWarnings = {
            // methods
            enable: false,
            experimentalMethods: false,
            send: false,
            // events
            events: {
                close: false,
                data: false,
                networkChanged: false,
                notification: false,
            },
        };
        _MetaMaskInpageProvider_networkVersion.set(this, void 0);
        // We shouldn't perform asynchronous work in the constructor, but at one
        // point we started doing so, and changing this class isn't worth it at
        // the time of writing.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._initializeStateAsync();
        __classPrivateFieldSet(this, _MetaMaskInpageProvider_networkVersion, null, "f");
        this.isMetaMask = true;
        this._sendSync = this._sendSync.bind(this);
        this.enable = this.enable.bind(this);
        this.send = this.send.bind(this);
        this.sendAsync = this.sendAsync.bind(this);
        this._warnOfDeprecation = this._warnOfDeprecation.bind(this);
        this._metamask = this._getExperimentalApi();
        // handle JSON-RPC notifications
        this._jsonRpcConnection.events.on('notification', (payload) => {
            const { method } = payload;
            if (EMITTED_NOTIFICATIONS.includes(method)) {
                // deprecated
                // emitted here because that was the original order
                this.emit('data', payload);
                // deprecated
                this.emit('notification', payload.params.result);
            }
        });
        // send website metadata
        if (shouldSendMetadata) {
            if (document.readyState === 'complete') {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                sendSiteMetadata(this._rpcEngine, this._log);
            }
            else {
                const domContentLoadedHandler = () => {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    sendSiteMetadata(this._rpcEngine, this._log);
                    window.removeEventListener('DOMContentLoaded', domContentLoadedHandler);
                };
                window.addEventListener('DOMContentLoaded', domContentLoadedHandler);
            }
        }
    }
    //====================
    // Read-only Properties
    //====================
    get chainId() {
        return super.chainId;
    }
    get networkVersion() {
        return __classPrivateFieldGet(this, _MetaMaskInpageProvider_networkVersion, "f");
    }
    get selectedAddress() {
        return super.selectedAddress;
    }
    //====================
    // Public Methods
    //====================
    /**
     * Submits an RPC request per the given JSON-RPC request object.
     *
     * @param payload - The RPC request object.
     * @param callback - The callback function.
     */
    sendAsync(payload, callback) {
        this._rpcRequest(payload, callback);
    }
    /**
     * We override the following event methods so that we can warn consumers
     * about deprecated events:
     * `addListener`, `on`, `once`, `prependListener`, `prependOnceListener`.
     */
    addListener(eventName, listener) {
        this._warnOfDeprecation(eventName);
        return super.addListener(eventName, listener);
    }
    on(eventName, listener) {
        this._warnOfDeprecation(eventName);
        return super.on(eventName, listener);
    }
    once(eventName, listener) {
        this._warnOfDeprecation(eventName);
        return super.once(eventName, listener);
    }
    prependListener(eventName, listener) {
        this._warnOfDeprecation(eventName);
        return super.prependListener(eventName, listener);
    }
    prependOnceListener(eventName, listener) {
        this._warnOfDeprecation(eventName);
        return super.prependOnceListener(eventName, listener);
    }
    //====================
    // Private Methods
    //====================
    /**
     * When the provider becomes disconnected, updates internal state and emits
     * required events. Idempotent with respect to the isRecoverable parameter.
     *
     * Error codes per the CloseEvent status codes as required by EIP-1193:
     * https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes.
     *
     * @param isRecoverable - Whether the disconnection is recoverable.
     * @param errorMessage - A custom error message.
     * @fires BaseProvider#disconnect - If the disconnection is not recoverable.
     */
    _handleDisconnect(isRecoverable, errorMessage) {
        super._handleDisconnect(isRecoverable, errorMessage);
        if (__classPrivateFieldGet(this, _MetaMaskInpageProvider_networkVersion, "f") && !isRecoverable) {
            __classPrivateFieldSet(this, _MetaMaskInpageProvider_networkVersion, null, "f");
        }
    }
    /**
     * Warns of deprecation for the given event, if applicable.
     *
     * @param eventName - The name of the event.
     */
    _warnOfDeprecation(eventName) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
        if (this._sentWarnings?.events[eventName] === false) {
            this._log.warn(messages.warnings.events[eventName]);
            this._sentWarnings.events[eventName] = true;
        }
    }
    //====================
    // Deprecated Methods
    //====================
    /**
     * Equivalent to: `ethereum.request('eth_requestAccounts')`.
     *
     * @deprecated Use request({ method: 'eth_requestAccounts' }) instead.
     * @returns A promise that resolves to an array of addresses.
     */
    async enable() {
        if (!this._sentWarnings.enable) {
            this._log.warn(messages.warnings.enableDeprecation);
            this._sentWarnings.enable = true;
        }
        return new Promise((resolve, reject) => {
            try {
                this._rpcRequest({ method: 'eth_requestAccounts', params: [] }, getRpcPromiseCallback(resolve, reject));
            }
            catch (error) {
                reject(error);
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    send(methodOrPayload, callbackOrArgs) {
        if (!this._sentWarnings.send) {
            this._log.warn(messages.warnings.sendDeprecation);
            this._sentWarnings.send = true;
        }
        if (typeof methodOrPayload === 'string' &&
            (!callbackOrArgs || Array.isArray(callbackOrArgs))) {
            return new Promise((resolve, reject) => {
                try {
                    this._rpcRequest({ method: methodOrPayload, params: callbackOrArgs }, getRpcPromiseCallback(resolve, reject, false));
                }
                catch (error) {
                    reject(error);
                }
            });
        }
        else if (methodOrPayload &&
            typeof methodOrPayload === 'object' &&
            typeof callbackOrArgs === 'function') {
            return this._rpcRequest(methodOrPayload, callbackOrArgs);
        }
        return this._sendSync(methodOrPayload);
    }
    /**
     * Internal backwards compatibility method, used in send.
     *
     * @param payload - A JSON-RPC request object.
     * @returns A JSON-RPC response object.
     * @deprecated
     */
    _sendSync(payload) {
        let result;
        switch (payload.method) {
            case 'eth_accounts':
                result = this.selectedAddress ? [this.selectedAddress] : [];
                break;
            case 'eth_coinbase':
                result = this.selectedAddress ?? null;
                break;
            case 'eth_uninstallFilter':
                this._rpcRequest(payload, NOOP);
                result = true;
                break;
            case 'net_version':
                result = __classPrivateFieldGet(this, _MetaMaskInpageProvider_networkVersion, "f") ?? null;
                break;
            default:
                throw new Error(messages.errors.unsupportedSync(payload.method));
        }
        return {
            id: payload.id,
            jsonrpc: payload.jsonrpc,
            result,
        };
    }
    /**
     * Constructor helper.
     *
     * Gets the experimental _metamask API as Proxy, so that we can warn consumers
     * about its experimental nature.
     *
     * @returns The experimental _metamask API.
     */
    _getExperimentalApi() {
        return new Proxy({
            /**
             * Determines if MetaMask is unlocked by the user.
             *
             * @returns Promise resolving to true if MetaMask is currently unlocked.
             */
            isUnlocked: async () => !this._state.isPermanentlyDisconnected,
            /**
             * Make a batch RPC request.
             *
             * @param requests - The RPC requests to make.
             */
            requestBatch: async (requests) => {
                if (!Array.isArray(requests)) {
                    throw rpcErrors.invalidRequest({
                        message: 'Batch requests must be made with an array of request objects.',
                        data: requests,
                    });
                }
                return new Promise((resolve, reject) => {
                    this._rpcRequest(requests, getRpcPromiseCallback(resolve, reject));
                });
            },
        }, {
            get: (obj, prop, ...args) => {
                if (!this._sentWarnings.experimentalMethods) {
                    this._log.warn(messages.warnings.experimentalMethods);
                    this._sentWarnings.experimentalMethods = true;
                }
                return Reflect.get(obj, prop, ...args);
            },
        });
    }
    /**
     * Upon receipt of a new chainId, networkVersion, and isConnected value
     * emits corresponding events and sets relevant public state. We interpret
     * a `networkVersion` with the value of `loading` to be null. The `isConnected`
     * value determines if a `connect` or recoverable `disconnect` has occurred.
     * Child classes that use the `networkVersion` for other purposes must implement
     * additional handling therefore.
     *
     * @fires MetamaskInpageProvider#networkChanged
     * @param networkInfo - An object with network info.
     * @param networkInfo.chainId - The latest chain ID.
     * @param networkInfo.networkVersion - The latest network ID.
     * @param networkInfo.isConnected - Whether the network is available.
     */
    _handleChainChanged({ chainId, networkVersion, isConnected, } = {}) {
        super._handleChainChanged({ chainId, networkVersion, isConnected });
        // The wallet will send a value of `loading` for `networkVersion` when it intends
        // to communicate that this value cannot be resolved and should be intepreted as null.
        // The wallet cannot directly send a null value for `networkVersion` because this
        // would be a breaking change for existing dapps that use their own embedded MetaMask provider
        // that expect this value to always be a integer string or the value 'loading'.
        const targetNetworkVersion = networkVersion === 'loading' ? null : networkVersion;
        if (targetNetworkVersion !== __classPrivateFieldGet(this, _MetaMaskInpageProvider_networkVersion, "f")) {
            __classPrivateFieldSet(this, _MetaMaskInpageProvider_networkVersion, targetNetworkVersion, "f");
            if (this._state.initialized) {
                this.emit('networkChanged', __classPrivateFieldGet(this, _MetaMaskInpageProvider_networkVersion, "f"));
            }
        }
    }
}
_MetaMaskInpageProvider_networkVersion = new WeakMap();
//# sourceMappingURL=MetaMaskInpageProvider.mjs.map