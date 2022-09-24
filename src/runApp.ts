import { PolywrapClient, Uri } from "@polywrap/client-js";
import { msgpackEncode } from "@polywrap/msgpack-js";
import prompts from "prompts";
import { extractAccessControlledUris } from "./extractAccessControlledUris";
import { invokeWithAccessControl } from "./getPolywrapClient";

export const runApp = async (uri: string, args: string[], polywrapClient: PolywrapClient) => {
  const acessControlledUris: string[] = [];
  await extractAccessControlledUris(uri, polywrapClient, acessControlledUris);

  const response = await prompts({
    type: "confirm",
    name: 'isAllowed',
    message: `App requested access to: \n${acessControlledUris.join("\n")}. \nDo you want to grant access?`
  });

  if (!response.isAllowed) {
    console.log(`Denied access for ${uri}`);
    return;
  }
  
  const { data, error: invokeError } = await invokeWithAccessControl(
    {
      uri: new Uri(uri),
      method: "main",
      args: msgpackEncode({
        args
      }),
    }, 
    acessControlledUris, 
    polywrapClient
  );

  if (invokeError || !data) {
    if (invokeError) {
      console.error(invokeError);
    } else {
      console.error("No data returned");
    }
  } else {
    console.log(data);
  }
};
