import {z} from "zod";
import {createTRPCRouter, protectedProcedure,} from "@/server/api/trpc";
import {inferenceProvider, inferenceProviderCredentials} from "@/server/db/schema";
import {eq} from "drizzle-orm";

export const providersRouter = createTRPCRouter({
  getUserProviders: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.db.query.inferenceProvider.findMany({
      where: (provider, {eq}) => eq(provider.userId, userId),
    });
  }),
  createProvider: protectedProcedure.input(z.object({ providerName: z.string().min(1), accountName: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    // Check if the accountName for the provider already exists
    const existingProvider = await ctx.db.query.inferenceProvider.findFirst({
      where: (provider, {eq, and}) => and(eq(provider.accountName, input.accountName), eq(provider.providerName, input.providerName)),
    });

    if (existingProvider) {
      throw new Error("Provider with the same account name already exists");
    }

    return ctx.db.insert(inferenceProvider).values({
      providerName: input.providerName,
      accountName: input.accountName,
      userId: ctx.session.user.id,
    }).returning();
  }),
  deleteProvider: protectedProcedure.input(z.object({
    id: z.number()
  })).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const provider = ctx.db.query.inferenceProvider.findFirst({
      where: (provider, {eq, and}) => and(eq(provider.userId, userId), eq(provider.id, input.id)),
    });

    if (!provider) {
      throw new Error("Provider not found");
    }

    // Delete associated credentials
    await ctx.db.delete(inferenceProviderCredentials).where(eq(inferenceProviderCredentials.inferenceProviderId, input.id));

    return ctx.db.delete(inferenceProvider).where(eq(inferenceProvider.id, input.id)).returning();
  }),
  getProviderCredentials: protectedProcedure.input(z.object({
    id: z.number()
  })).query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const provider = ctx.db.query.inferenceProvider.findFirst({
      where: (provider, {eq, and}) => and(eq(provider.userId, userId), eq(provider.id, input.id)),
    });

    if (!provider) {
      throw new Error("Provider not found");
    }

    return ctx.db.query.inferenceProviderCredentials.findMany({
      where: (credentials, {eq}) => eq(credentials.inferenceProviderId, input.id),
    });
  }),
  upsertProviderCredential: protectedProcedure.input(z.object({
    id: z.number().optional(),
    inferenceProviderId: z.number(),
    credentialKey: z.string().refine((value) => value.length > 0 && (value === 'OPENAI_API_KEY'), {
      message: "Please select a valid credential key"
    }),
    credentialValue: z.string().min(1),
  })).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const provider = ctx.db.query.inferenceProvider.findFirst({
      where: (provider, {eq, and}) => and(eq(provider.userId, userId), eq(provider.id, input.inferenceProviderId)),
    });

    if (!provider) {
      throw new Error("Provider not found");
    }

    if (input.id) {
      const id = input.id;
      const existingCredential = await ctx.db.query.inferenceProviderCredentials.findFirst({
        where: (credentials, {eq}) => eq(credentials.id, id),
      });

      if (!existingCredential) {
        throw new Error("Credential not found");
      }

      return ctx.db.update(inferenceProviderCredentials).set({
        credentialKey: input.credentialKey,
        credentialValue: input.credentialValue,
      }).where(eq(inferenceProviderCredentials.id, id)).returning();
    }

    const sameKeyCredential = await ctx.db.query.inferenceProviderCredentials.findFirst({
      where: (credentials, {eq, and}) => and(eq(credentials.credentialKey, input.credentialKey), eq(credentials.inferenceProviderId, input.inferenceProviderId)),
    });

    if (sameKeyCredential) {
      throw new Error("Credential with the same key already exists");
    }

    return ctx.db.insert(inferenceProviderCredentials).values({
      credentialKey: input.credentialKey,
      credentialValue: input.credentialValue,
      inferenceProviderId: input.inferenceProviderId,
    }).returning();
  })
})