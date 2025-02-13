import type { JsonRpcMiddleware } from "@metamask/json-rpc-engine";
import { JsonRpcEngine } from "@metamask/json-rpc-engine";
import SafeEventEmitter from "@metamask/safe-event-emitter";
import type { JsonRpcId, JsonRpcVersion2, JsonRpcParams, Json } from "@metamask/utils";
import type { ConsoleLike, Maybe } from "./utils.mjs";
export type UnvalidatedJsonRpcRequest = {
    id?: JsonRpcId;
    jsonrpc?: JsonRpcVersion2;
    method: string;
    params?: unknown;
};
export type BaseProviderOptions = {
    /**
     * The logging API to use.
     */
    logger?: ConsoleLike;
    /**
     * The maximum number of event listeners.
     */
    maxEventListeners?: number;
    /**
     * `@metamask/json-rpc-engine` middleware. The middleware will be inserted in the given
     * order immediately after engine initialization.
     */
    rpcMiddleware?: JsonRpcMiddleware<JsonRpcParams, Json>[];
};
export type RequestArguments = {
    /** The RPC method to request. */
    method: string;
    /** The params of the RPC method, if any. */
    params?: unknown[] | Record<string, unknown>;
};
export type BaseProviderState = {
    accounts: null | string[];
    isConnected: boolean;
    initialized: boolean;
    isPermanentlyDisconnected: boolean;
};
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
export declare abstract class BaseProvider extends SafeEventEmitter {
    #private;
    protected readonly _log: ConsoleLike;
    protected _state: BaseProviderState;
    protected _rpcEngine: JsonRpcEngine;
    protected static _defaultState: BaseProviderState;
    /**
     * Create a new instance of the provider.
     *
     * @param options - An options bag.
     * @param options.logger - The logging API to use. Default: `console`.
     * @param options.maxEventListeners - The maximum number of event
     * listeners. Default: 100.
     * @param options.rpcMiddleware - The RPC middleware stack. Default: [].
     */
    constructor({ logger, maxEventListeners, rpcMiddleware, }?: BaseProviderOptions);
    get chainId(): string | null;
    get selectedAddress(): string | null;
    /**
     * Returns whether the provider can process RPC requests.
     *
     * @returns Whether the provider can process RPC requests.
     */
    isConnected(): boolean;
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
    request<Type>(args: RequestArguments): Promise<Maybe<Type>>;
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
    protected _initializeState(initialState?: {
        accounts: string[];
        chainId: string;
        networkVersion?: string;
        isConnected?: boolean;
    }): void;
    /**
     * Internal RPC method. Forwards requests to background via the RPC engine.
     * Also remap ids inbound and outbound.
     *
     * @param payload - The RPC request object.
     * @param callback - The consumer's callback.
     * @returns The result of the RPC request.
     */
    protected _rpcRequest(payload: UnvalidatedJsonRpcRequest | UnvalidatedJsonRpcRequest[], callback: (...args: any[]) => void): void;
    /**
     * When the provider becomes connected, updates internal state and emits
     * required events. Idempotent.
     *
     * @param networkInfo - The options object.
     * @param networkInfo.chainId - The ID of the newly connected chain.
     * @param networkInfo.isConnected - Whether the network is available.
     * @fires MetaMaskInpageProvider#connect
     */
    protected _handleConnect({ chainId, isConnected, }: {
        chainId: string;
        isConnected?: boolean | undefined;
    }): void;
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
    protected _handleDisconnect(isRecoverable: boolean, errorMessage?: string): void;
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
    protected _handleChainChanged({ chainId, isConnected, }?: {
        chainId?: string;
        networkVersion?: string | undefined;
        isConnected?: boolean | undefined;
    } | undefined): void;
    /**
     * Called when accounts may have changed. Diffs the new accounts value with
     * the current one, updates all state as necessary, and emits the
     * accountsChanged event.
     *
     * @param accounts - The new accounts value.
     * @param isEthAccounts - Whether the accounts value was returned by
     * a call to eth_accounts.
     */
    protected _handleAccountsChanged(accounts: unknown[], isEthAccounts?: boolean): void;
}
//# sourceMappingURL=BaseProvider.d.mts.map