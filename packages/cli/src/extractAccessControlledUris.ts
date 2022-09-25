import { PolywrapClient, Uri, UriResolutionContext, Wrapper } from "@polywrap/client-js";
import { allAccessControlledUris } from "./getPolywrapClient";
import fs from "fs";
import { appDataPath } from "./main";
import { WasmWrapper } from "@polywrap/wasm-js";
import { buildCleanUriHistory } from "@polywrap/uri-resolvers-js";


export const extractAccessControlledUris = async (
  uri: string, 
  polywrapClient: PolywrapClient,
  acessControlledUris: string[]
): Promise<void> => {
  const result = await polywrapClient.tryResolveUri({uri });
  const wrapper: Wrapper = await polywrapClient["_loadWrapper"]({ uri });
  if (!result.ok) {
    return;
  }
  const finalUri = result.value.uri.uri;
  if (finalUri.startsWith("wrap://ipfs/")) {
    if (!(wrapper instanceof WasmWrapper)) {
      return;
    }

    const manifest = await (wrapper as WasmWrapper).getFile({ path: "wrap.info" });
    const wasmModule = await (wrapper as WasmWrapper).getFile({ path: "wrap.wasm" });
    const ipfsCid = finalUri.replace("wrap://ipfs/", "");

    if (!fs.existsSync(`${appDataPath}/cache/wrappers/ipfs/${ipfsCid}`)) {
      fs.mkdirSync(`${appDataPath}/cache/wrappers/ipfs/${ipfsCid}`);
    
      fs.writeFileSync(`${appDataPath}/cache/wrappers/ipfs/${ipfsCid}/wrap.info`, manifest);
      fs.writeFileSync(`${appDataPath}/cache/wrappers/ipfs/${ipfsCid}/wrap.wasm`, wasmModule);
    }
  }

  const manifest = await wrapper.getManifest({ noValidate: false }, polywrapClient);
  const importedUris = (manifest.abi.importedModuleTypes || []).map((importedModuleType) => new Uri(importedModuleType.uri).uri);
  
  const requestedUris = importedUris.filter((importedUri) => allAccessControlledUris.includes(importedUri));
  const otherUris = importedUris.filter((importedUri) => !allAccessControlledUris.includes(importedUri));
  if (requestedUris.length > 0) {
    acessControlledUris.push(...requestedUris);
  }

  for (const otherUri of otherUris) {
    await extractAccessControlledUris(otherUri, polywrapClient, acessControlledUris);
  }
};
