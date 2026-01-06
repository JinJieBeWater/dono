import alchemy from "alchemy";
import { Vite } from "alchemy/cloudflare";
import { config } from "dotenv";

const ENV_FILE = process.env.NODE_ENV ? `./.env.${process.env.NODE_ENV}` : "./.env.local";

config({ path: ENV_FILE, debug: true, override: true });

const app = await alchemy("dono-web");

export const web = await Vite("vite", {
  bindings: {
    VITE_SERVER_URL: alchemy.env.VITE_SERVER_URL!,
  },
});

console.log(`${app.name}-${app.stage}-web -> ${web.url}`);

await app.finalize();
