import {createTRPCRouter, protectedProcedure} from "@/server/api/trpc";
import {inferenceSource} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import {z} from "zod";

export const sourcesRouter = createTRPCRouter({
  getUserSources: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.db.query.inferenceSource.findMany({
      where: (source, {eq}) => eq(source.userId, userId),
    });
  }),
  createSource: protectedProcedure.input(z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    providerId: z.number(),
  })).mutation(async ({ ctx, input }) => {
    // Check if provider exists and belongs to the user
    const provider = await ctx.db.query.inferenceProvider.findFirst({
      where: (provider, {eq, and}) => and(eq(provider.userId, ctx.session.user.id), eq(provider.id, input.providerId)),
    });

    if (!provider) {
      throw new Error("Provider not found");
    }

    return ctx.db.insert(inferenceSource).values({
      name: input.name,
      type: input.type,
      providerId: input.providerId,
      userId: ctx.session.user.id,
    }).returning();
  }),
  updateSource: protectedProcedure.input(z.object({
    id: z.number(),
    name: z.string().min(1),
    type: z.string().min(1),
    providerId: z.number(),
  })).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const source = await ctx.db.query.inferenceSource.findFirst({
      where: (source, {eq, and}) => and(eq(source.userId, userId), eq(source.id, input.id)),
    });

    if (!source) {
      throw new Error("Source not found");
    }

    return ctx.db.update(inferenceSource).set({
      providerId: input.providerId,
      name: input.name,
      type: input.type,
    }).where(eq(inferenceSource.id, input.id)).returning();
  }),
  deleteSource: protectedProcedure.input(z.object({
    id: z.number()
  })).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const source = await ctx.db.query.inferenceSource.findFirst({
      where: (source, {eq, and}) => and(eq(source.userId, userId), eq(source.id, input.id)),
    });

    if (!source) {
      throw new Error("Source not found");
    }

    return ctx.db.delete(inferenceSource).where(eq(inferenceSource.id, input.id)).returning();
  }),
})