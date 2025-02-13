"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOOP = exports.isValidNetworkVersion = exports.isValidChainId = exports.getRpcPromiseCallback = exports.getDefaultExternalMiddleware = exports.EMITTED_NOTIFICATIONS = exports.FQDN_REGEX = exports.UUID_V4_REGEX = void 0;
const json_rpc_engine_1 = require("@metamask/json-rpc-engine");
const rpc_errors_1 = require("@metamask/rpc-errors");
const createRpcWarningMiddleware_1 = require("./middleware/createRpcWarningMiddleware.cjs");
// Constants
// https://github.com/thenativeweb/uuidv4/blob/bdcf3a3138bef4fb7c51f389a170666f9012c478/lib/uuidv4.ts#L5
exports.UUID_V4_REGEX = /(?:^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}$)|(?:^0{8}-0{4}-0{4}-0{4}-0{12}$)/u;
// https://stackoverflow.com/a/20204811
exports.FQDN_REGEX = /(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]\.)+[a-zA-Z]{2,63}$)/u;
// https://stackoverflow.com/a/9523559
const POSITIVE_INTEGER_REGEX = /^(\d*[1-9]\d*|0)$/u;
exports.EMITTED_NOTIFICATIONS = Object.freeze([
    'eth_subscription', // per eth-json-rpc-filters/subscriptionManager
]);
// Utility functions
/**
 * Gets the default middleware for external providers, consisting of an ID
 * remapping middleware and an error middleware.
 *
 * @param logger - The logger to use in the error middleware.
 * @returns An array of @metamask/json-rpc-engine middleware functions.
 */
const getDefaultExternalMiddleware = (logger = console) => [
    (0, json_rpc_engine_1.createIdRemapMiddleware)(),
    createErrorMiddleware(logger),
    (0, createRpcWarningMiddleware_1.createRpcWarningMiddleware)(logger),
];
exports.getDefaultExternalMiddleware = getDefaultExternalMiddleware;
/**
 * A `json-rpc-engine` middleware that logs RPC errors and validates the request
 * method.
 *
 * @param log - The logging API to use.
 * @returns A @metamask/json-rpc-engine middleware function.
 */
function createErrorMiddleware(log) {
    return (request, response, next) => {
        // json-rpc-engine will terminate the request when it notices this error
        if (typeof request.method !== 'string' || !request.method) {
            response.error = rpc_errors_1.rpcErrors.invalidRequest({
                message: `The request 'method' must be a non-empty string.`,
                data: request,
            });
        }
        next((done) => {
            const { error } = response;
            if (!error) {
                return done();
            }
            log.warn(`MetaMask - RPC Error: ${error.message}`, error);
            return done();
        });
    };
}
// resolve response.result or response, reject errors
const getRpcPromiseCallback = (resolve, reject, unwrapResult = true) => (error, response) => {
    if (error || response.error) {
        reject(error || response.error);
    }
    else {
        !unwrapResult || Array.isArray(response)
            ? resolve(response)
            : resolve(response.result);
    }
};
exports.getRpcPromiseCallback = getRpcPromiseCallback;
/**
 * Checks whether the given chain ID is valid, meaning if it is non-empty,
 * '0x'-prefixed string.
 *
 * @param chainId - The chain ID to validate.
 * @returns Whether the given chain ID is valid.
 */
const isValidChainId = (chainId) => Boolean(chainId) && typeof chainId === 'string' && chainId.startsWith('0x');
exports.isValidChainId = isValidChainId;
/**
 * Checks whether the given network version is valid, meaning if it is non-empty
 * integer string or the value 'loading'.
 *
 * @param networkVersion - The network version to validate.
 * @returns Whether the given network version is valid.
 */
const isValidNetworkVersion = (networkVersion) => typeof networkVersion === 'string' &&
    (POSITIVE_INTEGER_REGEX.test(networkVersion) || networkVersion === 'loading');
exports.isValidNetworkVersion = isValidNetworkVersion;
const NOOP = () => undefined;
exports.NOOP = NOOP;
//# sourceMappingURL=utils.cjs.map