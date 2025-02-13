import { isObject } from "@metamask/utils";
import { FQDN_REGEX, UUID_V4_REGEX } from "./utils.mjs";
/**
 * Describes the possible EIP-6963 event names
 */
var EIP6963EventNames;
(function (EIP6963EventNames) {
    EIP6963EventNames["Announce"] = "eip6963:announceProvider";
    EIP6963EventNames["Request"] = "eip6963:requestProvider";
})(EIP6963EventNames || (EIP6963EventNames = {}));
/**
 * Intended to be used by a dapp. Forwards every announced provider to the
 * provided handler by listening for * {@link EIP6963AnnounceProviderEvent},
 * and dispatches an {@link EIP6963RequestProviderEvent}.
 *
 * @param handleProvider - A function that handles an announced provider.
 */
export function requestProvider(handleProvider) {
    window.addEventListener(EIP6963EventNames.Announce, (event) => {
        if (!isValidAnnounceProviderEvent(event)) {
            throwErrorEIP6963(`Invalid EIP-6963 AnnounceProviderEvent object received from ${EIP6963EventNames.Announce} event.`);
        }
        handleProvider(event.detail);
    });
    window.dispatchEvent(new Event(EIP6963EventNames.Request));
}
/**
 * Intended to be used by a wallet. Announces a provider by dispatching
 * an {@link EIP6963AnnounceProviderEvent}, and listening for
 * {@link EIP6963RequestProviderEvent} to re-announce.
 *
 * @throws If the {@link EIP6963ProviderDetail} is invalid.
 * @param providerDetail - The {@link EIP6963ProviderDetail} to announce.
 * @param providerDetail.info - The {@link EIP6963ProviderInfo} to announce.
 * @param providerDetail.provider - The provider to announce.
 */
export function announceProvider(providerDetail) {
    if (!isValidProviderDetail(providerDetail)) {
        throwErrorEIP6963('Invalid EIP-6963 ProviderDetail object.');
    }
    const { info, provider } = providerDetail;
    const _announceProvider = () => window.dispatchEvent(new CustomEvent(EIP6963EventNames.Announce, {
        detail: Object.freeze({ info: { ...info }, provider }),
    }));
    _announceProvider();
    window.addEventListener(EIP6963EventNames.Request, (event) => {
        if (!isValidRequestProviderEvent(event)) {
            throwErrorEIP6963(`Invalid EIP-6963 RequestProviderEvent object received from ${EIP6963EventNames.Request} event.`);
        }
        _announceProvider();
    });
}
/**
 * Validates an {@link EIP6963RequestProviderEvent} object.
 *
 * @param event - The {@link EIP6963RequestProviderEvent} to validate.
 * @returns Whether the {@link EIP6963RequestProviderEvent} is valid.
 */
function isValidRequestProviderEvent(event) {
    return event instanceof Event && event.type === EIP6963EventNames.Request;
}
/**
 * Validates an {@link EIP6963AnnounceProviderEvent} object.
 *
 * @param event - The {@link EIP6963AnnounceProviderEvent} to validate.
 * @returns Whether the {@link EIP6963AnnounceProviderEvent} is valid.
 */
function isValidAnnounceProviderEvent(event) {
    return (event instanceof CustomEvent &&
        event.type === EIP6963EventNames.Announce &&
        Object.isFrozen(event.detail) &&
        isValidProviderDetail(event.detail));
}
/**
 * Validates an {@link EIP6963ProviderDetail} object.
 *
 * @param providerDetail - The {@link EIP6963ProviderDetail} to validate.
 * @returns Whether the {@link EIP6963ProviderDetail} is valid.
 */
function isValidProviderDetail(providerDetail) {
    if (!isObject(providerDetail) ||
        !isObject(providerDetail.info) ||
        !isObject(providerDetail.provider)) {
        return false;
    }
    const { info } = providerDetail;
    return (typeof info.uuid === 'string' &&
        UUID_V4_REGEX.test(info.uuid) &&
        typeof info.name === 'string' &&
        Boolean(info.name) &&
        typeof info.icon === 'string' &&
        info.icon.startsWith('data:image') &&
        typeof info.rdns === 'string' &&
        FQDN_REGEX.test(info.rdns));
}
/**
 * Throws an error with link to EIP-6963 specifications.
 *
 * @param message - The message to include.
 * @throws a friendly error with a link to EIP-6963.
 */
function throwErrorEIP6963(message) {
    throw new Error(`${message} See https://eips.ethereum.org/EIPS/eip-6963 for requirements.`);
}
//# sourceMappingURL=EIP6963.mjs.map