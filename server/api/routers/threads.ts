import {z} from "zod";
import {createTRPCRouter, protectedProcedure,} from "@/server/api/trpc";
import {thread} from "@/server/db/schema";

export const threadRouter = createTRPCRouter({
  getThread: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return ctx.db.query.thread.findFirst({
        // @ts-ignore
        where: (thread) => thread.id === input.id && thread.ownerId === userId,
      });
    }),
  getUsersThreads: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.session.user.id;
    console.log("userId", userId);
    return ctx.db.query.thread.findMany({
      where: (thread, {eq}) => eq(thread.ownerId, userId),
    });
  }),
  createThread: protectedProcedure
    .input(z.object({ title: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(thread).values({
        name: input.title,
        ownerId: ctx.session.user.id,
      }).returning();
    })
});