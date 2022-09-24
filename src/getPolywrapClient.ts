import { InvokerOptions, PolywrapClient, PolywrapClientConfig, Uri, UriResolutionResult, UriResolver } from "@polywrap/client-js";
import { Connection, Connections, ethereumPlugin } from "@polywrap/ethereum-plugin-js";

export const allAccessControlledUris = [
  "wrap://ens/ipfs.polywrap.eth",
  "wrap://ens/fs.polywrap.eth",
  "wrap://ens/ipfs-resolver.polywrap.eth",
  "wrap://ens/ens-resolver.polywrap.eth",
  "wrap://ens/fs-resolver.polywrap.eth",
  "wrap://ens/ethereum.polywrap.eth",
  "wrap://ens/http.polywrap.eth"
];

export let accessControlledUris: string[] = [
];

export let allAllowedUris: string[] = [];

export const invokeAsAdmin = async (
  options: InvokerOptions<string, PolywrapClientConfig>,
  polywrapClient: PolywrapClient
) => {
  accessControlledUris = [];

  return polywrapClient.invoke(options);
};

export const invokeWithAccessControl = async (
  options: InvokerOptions<Uri, PolywrapClientConfig>, 
  allowedUris: string[], 
  polywrapClient: PolywrapClient
) => {
  accessControlledUris = allAccessControlledUris;
  allAllowedUris = allowedUris;

  return polywrapClient.invoke(options);
};

export const getPolywrapClient = () => {
  const config = {
    ethereum: {
      providers: {
        mainnet: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        ropsten: `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        rinkeby: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        goerli: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        polygon: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
      },
    }
  };

  const client = process.env.INFURA_PROJECT_ID
    ? new PolywrapClient(
      {
        plugins: [
          {
            uri: "wrap://ens/ethereum.polywrap.eth",
            plugin: ethereumPlugin({
              connections: new Connections({
                networks: {
                  mainnet: new Connection({
                    provider: config.ethereum.providers.mainnet
                  }),
                  ropsten: new Connection({
                    provider: config.ethereum.providers.ropsten
                  }),
                  rinkeby: new Connection({
                    provider: config.ethereum.providers.rinkeby
                  }),
                  goerli: new Connection({
                    provider: config.ethereum.providers.goerli
                  }),
                  polygon: new Connection({
                    provider: config.ethereum.providers.polygon
                  }),
                }
              })
            }),
          },
        ]
      })
    : new PolywrapClient();

  return client;
};