import { BaseProvider } from "./BaseProvider.mjs";
import { announceWallet as caip294AnnounceWallet, requestWallet as caip294RequestWallet } from "./CAIP294.mjs";
import { announceProvider as eip6963AnnounceProvider, requestProvider as eip6963RequestProvider } from "./EIP6963.mjs";
import { createExternalExtensionProvider } from "./extension-provider/createExternalExtensionProvider.mjs";
import { initializeProvider, setGlobalProvider } from "./initializeInpageProvider.mjs";
import { MetaMaskInpageProvider, MetaMaskInpageProviderStreamName } from "./MetaMaskInpageProvider.mjs";
import { shimWeb3 } from "./shimWeb3.mjs";
import { StreamProvider } from "./StreamProvider.mjs";
export { BaseProvider, createExternalExtensionProvider, initializeProvider, MetaMaskInpageProviderStreamName, MetaMaskInpageProvider, setGlobalProvider, shimWeb3, StreamProvider, eip6963AnnounceProvider, eip6963RequestProvider, caip294AnnounceWallet, caip294RequestWallet };
//# sourceMappingURL=index.mjs.map