import { postRouter } from "@/server/api/routers/post";
import {threadRouter} from "@/server/api/routers/threads";
import {messageRouter} from "@/server/api/routers/messages";
import {
  createCallerFactory,
  createTRPCRouter
} from "@/server/api/trpc";
import {providersRouter} from "@/server/api/routers/providers";
import {sourcesRouter} from "@/server/api/routers/sources";


/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  threads: threadRouter,
  messages: messageRouter,
  providers: providersRouter,
  sources: sourcesRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
