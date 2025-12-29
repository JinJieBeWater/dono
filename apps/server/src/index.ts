import { createContext } from "@dono/api/context";
import { appRouter } from "@dono/api/routers/index";
import { auth } from "@dono/auth";
import { env } from "@dono/env/server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import * as SyncBackend from "@livestore/sync-cf/cf-worker";
import { SyncBackendDO } from "./do/sync-backend-do";

export { SyncBackendDO };

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const searchParams = SyncBackend.matchSyncRequest(c.req.raw);

  if (searchParams !== undefined) {
    return SyncBackend.handleSyncRequest({
      request: c.req.raw,
      searchParams,
      ctx: c.executionCtx,
      syncBackendBinding: "SYNC_BACKEND_DO",
      validatePayload: async (_payload, { storeId, headers }) => {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session?.user) {
          throw new Error("Unauthorized: Invalid session");
        }

        console.log("Validating user and store", session.user.id, storeId);
      },
    });
  }
  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
