import alchemy from "alchemy";
import { Vite } from "alchemy/cloudflare";

import { config } from "dotenv";

import path from "path";

config({ path: path.join(import.meta.dirname, ".env") });

const app = await alchemy("dono-web");

export const web = await Vite("vite", {
  bindings: {
    VITE_SERVER_URL: alchemy.env.VITE_SERVER_URL!,
  },
});

console.log(`Web    -> ${web.url}`);

await app.finalize();
