import type { JsonRpcMiddleware } from "@metamask/json-rpc-engine";
import type SafeEventEmitter from "@metamask/safe-event-emitter";
import type { Json, JsonRpcParams } from "@metamask/utils";
import type { Duplex } from "readable-stream";
import type { BaseProviderOptions } from "./BaseProvider.cjs";
import { BaseProvider } from "./BaseProvider.cjs";
export type StreamProviderOptions = BaseProviderOptions;
export type JsonRpcConnection = {
    events: SafeEventEmitter;
    middleware: JsonRpcMiddleware<JsonRpcParams, Json>;
    stream: Duplex;
};
/**
 * An abstract EIP-1193 provider wired to some duplex stream via a
 * `json-rpc-middleware-stream` JSON-RPC stream middleware. Implementers must
 * call {@link AbstractStreamProvider._initializeStateAsync} after instantiation
 * to initialize the provider's state.
 */
export declare abstract class AbstractStreamProvider extends BaseProvider {
    protected _jsonRpcConnection: JsonRpcConnection;
    /**
     * Creates a new AbstractStreamProvider instance.
     *
     * @param connectionStream - A Node.js duplex stream.
     * @param options - An options bag.
     * @param options.logger - The logging API to use. Default: `console`.
     * @param options.maxEventListeners - The maximum number of event
     * listeners. Default: 100.
     * @param options.rpcMiddleware - The RPC middleware stack to use.
     */
    constructor(connectionStream: Duplex, { logger, maxEventListeners, rpcMiddleware, }?: StreamProviderOptions);
    /**
     * MUST be called by child classes.
     *
     * Calls `metamask_getProviderState` and passes the result to
     * {@link BaseProvider._initializeState}. Logs an error if getting initial state
     * fails. Throws if called after initialization has completed.
     */
    protected _initializeStateAsync(): Promise<void>;
    /**
     * Called when connection is lost to critical streams. Emits an 'error' event
     * from the provider with the error message and stack if present.
     *
     * @param streamName - The name of the stream that disconnected.
     * @param error - The error that caused the disconnection.
     * @fires BaseProvider#disconnect - If the provider is not already
     * disconnected.
     */
    private _handleStreamDisconnect;
    /**
     * Upon receipt of a new chainId and networkVersion, emits corresponding
     * events and sets relevant public state. Child classes that use the
     * `networkVersion` for other purposes must implement additional handling.
     *
     * @fires BaseProvider#chainChanged
     * @param networkInfo - An object with network info.
     * @param networkInfo.chainId - The latest chain ID.
     * @param networkInfo.networkVersion - The latest network ID.
     * @param networkInfo.isConnected - Whether the network is available.
     */
    protected _handleChainChanged({ chainId, networkVersion, isConnected, }?: {
        chainId?: string | undefined;
        networkVersion?: string | undefined;
        isConnected?: boolean | undefined;
    }): void;
}
/**
 * An EIP-1193 provider wired to some duplex stream via a
 * `json-rpc-middleware-stream` JSON-RPC stream middleware. Consumers must
 * call {@link StreamProvider.initialize} after instantiation to complete
 * initialization.
 */
export declare class StreamProvider extends AbstractStreamProvider {
    /**
     * MUST be called after instantiation to complete initialization.
     *
     * Calls `metamask_getProviderState` and passes the result to
     * {@link BaseProvider._initializeState}. Logs an error if getting initial state
     * fails. Throws if called after initialization has completed.
     */
    initialize(): Promise<void>;
}
//# sourceMappingURL=StreamProvider.d.cts.map