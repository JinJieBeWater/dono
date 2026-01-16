import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { todoRouter } from "./todo";
import z from "zod";
import { env } from "@dono/env/server";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  userClientDO: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
      }),
    )
    .handler(async ({ input: { storeId } }) => {
      await env.USER_CLIENT_DO.getByName(storeId).initialize(storeId);
      return {
        message: "OK",
      };
    }),
  todo: todoRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
