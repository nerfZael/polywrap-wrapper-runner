import { PolywrapClient, Uri, Wrapper } from "@polywrap/client-js";
import { allAccessControlledUris } from "./getPolywrapClient";

export const extractAccessControlledUris = async (
  uri: string, 
  polywrapClient: PolywrapClient,
  acessControlledUris: string[]
): Promise<void> => {
  await polywrapClient.tryResolveUri({uri});
  const wrapper: Wrapper = await polywrapClient["_loadWrapper"]({ uri });

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
