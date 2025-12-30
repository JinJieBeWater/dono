import alchemy from "alchemy";
import { Vite } from "alchemy/cloudflare";

import { config } from "dotenv";

import { server } from "server/alchemy";
import path from "path";

config({ path: path.join(import.meta.dirname, ".env") });

const app = await alchemy("web");

export const web = await Vite("web", {
  assets: "dist",
  bindings: {
    VITE_SERVER_URL: alchemy.env.VITE_SERVER_URL!,
    server,
  },
});

console.log(`Web    -> ${web.url}`);

await app.finalize();
