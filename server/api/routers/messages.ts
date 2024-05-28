import {z} from "zod";
import {createTRPCRouter, protectedProcedure,} from "@/server/api/trpc";
import {userMessages} from "@/server/db/schema";
import {inferenceMessage} from "@/server/db/schema";

export const messageRouter = createTRPCRouter({
  getUserMessages: protectedProcedure.input(z.object({ threadId: z.number() })).query(({ ctx, input }) => {
    console.log("getUserMessages")
    const userId = ctx.session.user.id;
    return ctx.db.query.userMessages.findMany({
      where: (message, {eq, and}) => and(eq(message.threadId, input.threadId), eq(message.userId, userId)),
    });
  }),
  getInferenceMessages: protectedProcedure.input(z.object({ threadId: z.number() })).query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const thread = await ctx.db.query.thread.findFirst({
      where: (thread, {eq}) => eq(thread.id, input.threadId),
    });


    if (!thread) {
      throw new Error("Thread not found");
    }

    if (thread.ownerId !== userId) {
      throw new Error("Unauthorized");
    }

    return ctx.db.query.inferenceMessage.findMany({
      where: (message, {eq}) => eq(message.threadId, input.threadId),
    });
  }),
  sendUserMessage: protectedProcedure.input(z.object({ threadId: z.number(), content: z.object({
      message: z.string().optional(),
      imageId: z.string().optional(),
      documentId: z.string().optional(),
    }), type: z.string() })).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    return ctx.db.insert(userMessages).values({
      threadId: input.threadId,
      type: input.type,
      userId,
      content: input.content,
    }).returning();
  }),
  sendInferenceMessage: protectedProcedure.input(z.object({ threadId: z.number(), sourceId: z.number(), type: z.string(), finishedStreaming: z.date(), content: z.object({
      message: z.string(),
      imageId: z.string().optional(),
    }) })).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const thread = await ctx.db.query.thread.findFirst({
      where: (thread, {eq}) => eq(thread.id, input.threadId),
    });

    if (!thread) {
      throw new Error("Thread not found");
    }

    if (thread.ownerId !== userId) {
      throw new Error("Unauthorized");
    }

    return ctx.db.insert(inferenceMessage).values({
      type: input.type,
      finishedStreaming: input.finishedStreaming,
      threadId: input.threadId,
      sourceId: input.sourceId,
      content: input.content,
    }).returning();
  }),
})