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
var _BaseProvider_chainId, _BaseProvider_selectedAddress;
function $importDefault(module) {
    if (module?.__esModule) {
        return module.default;
    }
    return module;
}
import { JsonRpcEngine } from "@metamask/json-rpc-engine";
import { rpcErrors, JsonRpcError } from "@metamask/rpc-errors";
import SafeEventEmitter from "@metamask/safe-event-emitter";
import $dequal from "fast-deep-equal";
const dequal = $importDefault($dequal);
import messages from "./messages.mjs";
import { getRpcPromiseCallback, isValidChainId } from "./utils.mjs";
/**
 * An abstract class implementing the EIP-1193 interface. Implementers must:
 *
 * 1. At initialization, push a middleware to the internal `_rpcEngine` that
 * hands off requests to the server and receives responses in return.
 * 2. At initialization, retrieve initial state and call
 * {@link BaseProvider._initializeState} **once**.
 * 3. Ensure that the provider's state is synchronized with the wallet.
 * 4. Ensure that notifications are received and emitted as appropriate.
 */
export class BaseProvider extends SafeEventEmitter {
    /**
     * Create a new instance of the provider.
     *
     * @param options - An options bag.
     * @param options.logger - The logging API to use. Default: `console`.
     * @param options.maxEventListeners - The maximum number of event
     * listeners. Default: 100.
     * @param options.rpcMiddleware - The RPC middleware stack. Default: [].
     */
    constructor({ logger = console, maxEventListeners = 100, rpcMiddleware = [], } = {}) {
        super();
        /**
         * The chain ID of the currently connected Ethereum chain.
         * See [chainId.network]{@link https://chainid.network} for more information.
         */
        _BaseProvider_chainId.set(this, void 0);
        /**
         * The user's currently selected Ethereum address.
         * If null, MetaMask is either locked or the user has not permitted any
         * addresses to be viewed.
         */
        _BaseProvider_selectedAddress.set(this, void 0);
        this._log = logger;
        this.setMaxListeners(maxEventListeners);
        // Private state
        this._state = {
            ...BaseProvider._defaultState,
        };
        // Public state
        __classPrivateFieldSet(this, _BaseProvider_selectedAddress, null, "f");
        __classPrivateFieldSet(this, _BaseProvider_chainId, null, "f");
        // Bind functions to prevent consumers from making unbound calls
        this._handleAccountsChanged = this._handleAccountsChanged.bind(this);
        this._handleConnect = this._handleConnect.bind(this);
        this._handleChainChanged = this._handleChainChanged.bind(this);
        this._handleDisconnect = this._handleDisconnect.bind(this);
        this._rpcRequest = this._rpcRequest.bind(this);
        this.request = this.request.bind(this);
        // Handle RPC requests via dapp-side RPC engine.
        //
        // ATTN: Implementers must push a middleware that hands off requests to
        // the server.
        const rpcEngine = new JsonRpcEngine();
        rpcMiddleware.forEach((middleware) => rpcEngine.push(middleware));
        this._rpcEngine = rpcEngine;
    }
    //====================
    // Public Properties
    //====================
    get chainId() {
        return __classPrivateFieldGet(this, _BaseProvider_chainId, "f");
    }
    get selectedAddress() {
        return __classPrivateFieldGet(this, _BaseProvider_selectedAddress, "f");
    }
    //====================
    // Public Methods
    //====================
    /**
     * Returns whether the provider can process RPC requests.
     *
     * @returns Whether the provider can process RPC requests.
     */
    isConnected() {
        return this._state.isConnected;
    }
    /**
     * Submits an RPC request for the given method, with the given params.
     * Resolves with the result of the method call, or rejects on error.
     *
     * @param args - The RPC request arguments.
     * @param args.method - The RPC method name.
     * @param args.params - The parameters for the RPC method.
     * @returns A Promise that resolves with the result of the RPC method,
     * or rejects if an error is encountered.
     */
    async request(args) {
        if (!args || typeof args !== 'object' || Array.isArray(args)) {
            throw rpcErrors.invalidRequest({
                message: messages.errors.invalidRequestArgs(),
                data: args,
            });
        }
        const { method, params } = args;
        if (typeof method !== 'string' || method.length === 0) {
            throw rpcErrors.invalidRequest({
                message: messages.errors.invalidRequestMethod(),
                data: args,
            });
        }
        if (params !== undefined &&
            !Array.isArray(params) &&
            (typeof params !== 'object' || params === null)) {
            throw rpcErrors.invalidRequest({
                message: messages.errors.invalidRequestParams(),
                data: args,
            });
        }
        const payload = params === undefined || params === null
            ? {
                method,
            }
            : {
                method,
                params,
            };
        return new Promise((resolve, reject) => {
            this._rpcRequest(payload, getRpcPromiseCallback(resolve, reject));
        });
    }
    //====================
    // Private Methods
    //====================
    /**
     * MUST be called by child classes.
     *
     * Sets initial state if provided and marks this provider as initialized.
     * Throws if called more than once.
     *
     * Permits the `networkVersion` field in the parameter object for
     * compatibility with child classes that use this value.
     *
     * @param initialState - The provider's initial state.
     * @param initialState.accounts - The user's accounts.
     * @param initialState.chainId - The chain ID.
     * @param initialState.networkVersion - The network version.
     * @param initialState.isConnected - Whether the network is available.
     * @fires BaseProvider#_initialized - If `initialState` is defined.
     * @fires BaseProvider#connect - If `initialState` is defined.
     */
    _initializeState(initialState) {
        if (this._state.initialized) {
            throw new Error('Provider already initialized.');
        }
        if (initialState) {
            const { accounts, chainId, networkVersion, isConnected } = initialState;
            // EIP-1193 connect
            this._handleConnect({ chainId, isConnected });
            this._handleChainChanged({ chainId, networkVersion, isConnected });
            this._handleAccountsChanged(accounts);
        }
        // Mark provider as initialized regardless of whether initial state was
        // retrieved.
        this._state.initialized = true;
        this.emit('_initialized');
    }
    /**
     * Internal RPC method. Forwards requests to background via the RPC engine.
     * Also remap ids inbound and outbound.
     *
     * @param payload - The RPC request object.
     * @param callback - The consumer's callback.
     * @returns The result of the RPC request.
     */
    _rpcRequest(payload, callback) {
        let callbackWrapper = callback;
        if (!Array.isArray(payload)) {
            if (!payload.jsonrpc) {
                payload.jsonrpc = '2.0';
            }
            if (payload.method === 'eth_accounts' ||
                payload.method === 'eth_requestAccounts') {
                // handle accounts changing
                callbackWrapper = (error, response) => {
                    this._handleAccountsChanged(response.result ?? [], payload.method === 'eth_accounts');
                    callback(error, response);
                };
            }
            return this._rpcEngine.handle(payload, callbackWrapper);
        }
        return this._rpcEngine.handle(payload, callbackWrapper);
    }
    /**
     * When the provider becomes connected, updates internal state and emits
     * required events. Idempotent.
     *
     * @param networkInfo - The options object.
     * @param networkInfo.chainId - The ID of the newly connected chain.
     * @param networkInfo.isConnected - Whether the network is available.
     * @fires MetaMaskInpageProvider#connect
     */
    _handleConnect({ chainId, isConnected, }) {
        if (!this._state.isConnected && isConnected) {
            this._state.isConnected = true;
            this.emit('connect', { chainId });
            this._log.debug(messages.info.connected(chainId));
        }
    }
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
        if (this._state.isConnected ||
            (!this._state.isPermanentlyDisconnected && !isRecoverable)) {
            this._state.isConnected = false;
            let error;
            if (isRecoverable) {
                error = new JsonRpcError(1013, // Try again later
                errorMessage ?? messages.errors.disconnected());
                this._log.debug(error);
            }
            else {
                error = new JsonRpcError(1011, // Internal error
                errorMessage ?? messages.errors.permanentlyDisconnected());
                this._log.error(error);
                __classPrivateFieldSet(this, _BaseProvider_chainId, null, "f");
                this._state.accounts = null;
                __classPrivateFieldSet(this, _BaseProvider_selectedAddress, null, "f");
                this._state.isPermanentlyDisconnected = true;
            }
            this.emit('disconnect', error);
        }
    }
    /**
     * Upon receipt of a new `chainId`, emits the corresponding event and sets
     * and sets relevant public state. Does nothing if the given `chainId` is
     * equivalent to the existing value.
     *
     * Permits the `networkVersion` field in the parameter object for
     * compatibility with child classes that use this value.
     *
     * @fires BaseProvider#chainChanged
     * @param networkInfo - An object with network info.
     * @param networkInfo.chainId - The latest chain ID.
     * @param networkInfo.isConnected - Whether the network is available.
     */
    _handleChainChanged({ chainId, isConnected, } = {}) {
        if (!isValidChainId(chainId)) {
            this._log.error(messages.errors.invalidNetworkParams(), { chainId });
            return;
        }
        this._handleConnect({ chainId, isConnected });
        if (chainId !== __classPrivateFieldGet(this, _BaseProvider_chainId, "f")) {
            __classPrivateFieldSet(this, _BaseProvider_chainId, chainId, "f");
            if (this._state.initialized) {
                this.emit('chainChanged', __classPrivateFieldGet(this, _BaseProvider_chainId, "f"));
            }
        }
    }
    /**
     * Called when accounts may have changed. Diffs the new accounts value with
     * the current one, updates all state as necessary, and emits the
     * accountsChanged event.
     *
     * @param accounts - The new accounts value.
     * @param isEthAccounts - Whether the accounts value was returned by
     * a call to eth_accounts.
     */
    _handleAccountsChanged(accounts, isEthAccounts = false) {
        let _accounts = accounts;
        if (!Array.isArray(accounts)) {
            this._log.error('MetaMask: Received invalid accounts parameter. Please report this bug.', accounts);
            _accounts = [];
        }
        for (const account of accounts) {
            if (typeof account !== 'string') {
                this._log.error('MetaMask: Received non-string account. Please report this bug.', accounts);
                _accounts = [];
                break;
            }
        }
        // emit accountsChanged if anything about the accounts array has changed
        if (!dequal(this._state.accounts, _accounts)) {
            // we should always have the correct accounts even before eth_accounts
            // returns
            if (isEthAccounts && this._state.accounts !== null) {
                this._log.error(`MetaMask: 'eth_accounts' unexpectedly updated accounts. Please report this bug.`, _accounts);
            }
            this._state.accounts = _accounts;
            // handle selectedAddress
            if (__classPrivateFieldGet(this, _BaseProvider_selectedAddress, "f") !== _accounts[0]) {
                __classPrivateFieldSet(this, _BaseProvider_selectedAddress, _accounts[0] || null, "f");
            }
            // finally, after all state has been updated, emit the event
            if (this._state.initialized) {
                const _nextAccounts = [..._accounts];
                this.emit('accountsChanged', _nextAccounts);
            }
        }
    }
}
_BaseProvider_chainId = new WeakMap(), _BaseProvider_selectedAddress = new WeakMap();
BaseProvider._defaultState = {
    accounts: null,
    isConnected: false,
    initialized: false,
    isPermanentlyDisconnected: false,
};
//# sourceMappingURL=BaseProvider.mjs.map