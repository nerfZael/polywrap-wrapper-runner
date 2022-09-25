import { coreInterfaceUris, InvokerOptions, PolywrapClient, PolywrapClientConfig, Uri } from "@polywrap/client-js";
import { Connection, Connections, ethereumPlugin } from "@polywrap/ethereum-plugin-js";
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js";
import { ipfsResolverPlugin } from "@polywrap/ipfs-resolver-plugin-js";
import { fileSystemPlugin } from "@polywrap/fs-plugin-js";
import { fileSystemResolverPlugin } from "@polywrap/fs-resolver-plugin-js";
import { ocrResolverPlugin } from "@nerfzael/ocr-resolver-plugin-wrapper";
import { ensContenthashResolverPlugin } from "@nerfzael/ens-contenthash-resolver-plugin-wrapper";
import { ipfsEnsContenthashResolverPlugin } from "@nerfzael/ipfs-ens-contenthash-resolver-plugin-wrapper";
import { ocrEnsContenthashResolverPlugin } from "@nerfzael/ocr-ens-contenthash-resolver-plugin-wrapper";
import { wrapClientPlugin } from "@nerfzael/wrap-client-plugin-wrapper";

export const allAccessControlledUris = [
  "wrap://ens/ipfs.polywrap.eth",
  "wrap://ens/fs.polywrap.eth",
  "wrap://ens/ipfs-resolver.polywrap.eth",
  "wrap://ens/ens-resolver.polywrap.eth",
  "wrap://ens/fs-resolver.polywrap.eth",
  "wrap://ens/ethereum.polywrap.eth",
  "wrap://ens/http.polywrap.eth",
  "wrap://ens/ipfs-resolver.polywrap.eth",
  "wrap://ens/ens-contenthash-resolver.eth",
  "wrap://ens/ipfs-ens-contenthash-resolver.eth",
  "wrap://ens/ocr-ens-contenthash-resolver.eth",
  "wrap://ens/ocr-resolver.eth",
  "wrap://ens/wrap-client.eth",
  "wrap://ens/ipfs.polywrap.eth",
  "wrap://ens/fs.polywrap.eth",
  "wrap://ens/fs-resolver.polywrap.eth",
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

  const envs = [
    {
      uri: "wrap://ens/http.polywrap.eth",
      env: {
        urlPrefixWhitelist: [
        ],
        urlPrefixBlocklist: [
          "file",
          "localhost",
          "http://localhost",
          "https://localhost",
          "127.0.0.1",
          "http://127.0.0.1",
          "https://127.0.0.1",
        ]
      }
    },
  ];

  const interfaces = [
    {
      interface: coreInterfaceUris.uriResolver.uri,
      implementations: [
        "wrap://ens/ipfs-resolver.polywrap.eth",
        "wrap://ens/ens-contenthash-resolver.eth",
        "wrap://ens/ipfs-ens-contenthash-resolver.eth",
        "wrap://ens/ocr-ens-contenthash-resolver.eth",
        "wrap://ens/ocr-resolver.eth"
      ],
    },
  ];

  const plugins = [
    {
      uri: "wrap://ens/ipfs-resolver.polywrap.eth",
      plugin: ipfsResolverPlugin({}),
    },
    {
      uri: "wrap://ens/ens-contenthash-resolver.eth",
      plugin: ensContenthashResolverPlugin({})
    },
    {
      uri: "wrap://ens/ipfs-ens-contenthash-resolver.eth",
      plugin: ipfsEnsContenthashResolverPlugin({})
    },
    {
      uri: "wrap://ens/ocr-ens-contenthash-resolver.eth",
      plugin: ocrEnsContenthashResolverPlugin({})
    },
    {
      uri: "wrap://ens/ocr-resolver.eth",
      plugin: ocrResolverPlugin({})
    },
    {
      uri: "wrap://ens/wrap-client.eth",
      plugin: wrapClientPlugin({})
    },
    {
      uri: "wrap://ens/ipfs.polywrap.eth",
      plugin: ipfsPlugin({}),
    },
    {
      uri: "wrap://ens/fs.polywrap.eth",
      plugin: fileSystemPlugin({}),
    },
    {
      uri: "wrap://ens/fs-resolver.polywrap.eth",
      plugin: fileSystemResolverPlugin({}),
    },
  ];

  const client = process.env.INFURA_PROJECT_ID
    ? new PolywrapClient(
      {
        envs,
        interfaces,
        plugins: [
          ...plugins,
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
    : new PolywrapClient({
        envs,
        interfaces,
        plugins: [
          ...plugins,
          {
            uri: "wrap://ens/ethereum.polywrap.eth",
            plugin: ethereumPlugin({
              connections: new Connections({
                networks: {
                  mainnet: new Connection({
                    provider:
                      "https://mainnet.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
                  }),
                  goerli: new Connection({
                    provider:
                      "https://goerli.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
                  }),
                },
              }),
            }),
          }
        ],
      });

  return client;
};