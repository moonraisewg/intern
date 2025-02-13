import { ERC1155, ERC721 } from "../constants.mjs";
import messages from "../messages.mjs";
/**
 * Create JSON-RPC middleware that logs warnings for deprecated RPC methods.
 *
 * @param log - The logging API to use.
 * @returns The JSON-RPC middleware.
 */
export function createRpcWarningMiddleware(log) {
    const sentWarnings = {
        ethDecryptDeprecation: false,
        ethGetEncryptionPublicKeyDeprecation: false,
        walletWatchAssetNFTExperimental: false,
    };
    return (req, _res, next) => {
        if (!sentWarnings.ethDecryptDeprecation && req.method === 'eth_decrypt') {
            log.warn(messages.warnings.rpc.ethDecryptDeprecation);
            sentWarnings.ethDecryptDeprecation = true;
        }
        else if (!sentWarnings.ethGetEncryptionPublicKeyDeprecation &&
            req.method === 'eth_getEncryptionPublicKey') {
            log.warn(messages.warnings.rpc.ethGetEncryptionPublicKeyDeprecation);
            sentWarnings.ethGetEncryptionPublicKeyDeprecation = true;
        }
        else if (!sentWarnings.walletWatchAssetNFTExperimental &&
            req.method === 'wallet_watchAsset' &&
            [ERC721, ERC1155].includes(req.params?.type || '')) {
            log.warn(messages.warnings.rpc.walletWatchAssetNFTExperimental);
            sentWarnings.walletWatchAssetNFTExperimental = true;
        }
        next();
    };
}
//# sourceMappingURL=createRpcWarningMiddleware.mjs.map