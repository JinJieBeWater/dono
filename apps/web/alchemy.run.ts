import { env } from "@dono/env/web";
import alchemy from "alchemy";
import { Vite } from "alchemy/cloudflare";
import { config } from "dotenv";
import path from "path";
// import { server } from "server/alchemy";

const ENV_FILE = process.env.NODE_ENV ? `./.env.${process.env.NODE_ENV}` : "./.env";

config({ path: path.join(import.meta.dirname, ENV_FILE), debug: true, override: true });

const app = await alchemy("dono-web");

export const web = await Vite("vite", {
  bindings: {
    VITE_SERVER_URL: env.VITE_SERVER_URL!,
    // VITE_SERVER_URL: server.url!,
    // server,
  },
});

console.log(`${app.name}-${app.stage}-web -> ${web.url}`);

await app.finalize();
