#!/usr/bin/env node
import { program } from "commander";
import * as dotenv from "dotenv"
import { getPolywrapClient } from "./getPolywrapClient";
import { runApp } from "./runApp";

dotenv.config();

(async () => {
  program
    .arguments("<string...>")
    .action(async (args) => {
      const uri = args[0];
      const appArgs = args.slice(1);

      await runApp(
        parseUri(uri), 
        appArgs,
        getPolywrapClient()
      );
    });
    
  program.parse(process.argv);
})();

function parseUri(uri: string): string {
  if(uri.endsWith(".eth") && !uri.startsWith("wrap://ens/") && !uri.startsWith("ens/")) {
    return `wrap://ens/${uri}`;
  } else if (uri.startsWith("Qm")) {
    return `wrap://ipfs/${uri}`;
  } else if (uri.startsWith("ipfs://")) {
    return `wrap://ipfs/${uri.slice("ipfs://".length, uri.length)}`;
  } else if (uri.startsWith(".") || uri.startsWith("/")) {
    return `wrap://file/${uri}`;
  } else if (!uri.includes("/")) {
    return `wrap://pwr/${uri}`;
  } else {
    return uri;
  }
}
