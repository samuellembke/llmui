import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer, jsonb,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => `llm-ui_${name}`);

export const inferenceProvider = createTable("inferenceProvider", {
  id: serial("id").primaryKey(),
  providerName: varchar("providerName", { length: 255 }).notNull(),
  accountName: varchar("accountName", { length: 255 }).notNull(),
  userId: varchar("userId", { length: 255 }).notNull().references(() => users.id),
})

export const inferenceProviderRelations = relations(inferenceProvider, ({ one, many }) => ({
  user: one(users, { fields: [inferenceProvider.userId], references: [users.id] }),
  inferenceProviderCredentials: many(inferenceProviderCredentials),
  inferenceSource: many(inferenceSource),
}));

export const inferenceProviderCredentials = createTable("inferenceProviderCredentials", {
  id: serial("id").primaryKey(),
  inferenceProviderId: integer("inferenceProviderId").notNull().references(() => inferenceProvider.id),
  credentialKey: varchar("credentialKey", { length: 255 }).notNull(),
  credentialValue: text("credentialValue").notNull(),
})

export const inferenceProviderCredentialsRelations = relations(inferenceProviderCredentials, ({ one }) => ({
  inferenceProvider: one(inferenceProvider, { fields: [inferenceProviderCredentials.inferenceProviderId], references: [inferenceProvider.id] }),
}));

export const inferenceSource = createTable("inferenceSource", {
  id: serial("id").primaryKey(),
  providerId: integer("providerId").notNull().references(() => inferenceProvider.id),
  type: varchar("type", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
})

export const inferenceSourceRelations = relations(inferenceSource, ({ one, many }) => ({
  inferenceProvider: one(inferenceProvider, { fields: [inferenceSource.providerId], references: [inferenceProvider.id] }),
  inferenceMessages: many(inferenceMessage),
}));

export const thread = createTable("threads", {
  id: serial("id").primaryKey(),
  ownerId: varchar("ownerId", { length: 255 }).notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
})

export const threadRelations = relations(thread, ({ one, many }) => ({
  owner: one(users, { fields: [thread.ownerId], references: [users.id] }),
  inferenceMessages: many(inferenceMessage),
  userMessages: many(userMessages),
}));

export const inferenceMessage = createTable("inferenceMessage", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  sourceId: integer("sourceId").notNull().references(() => inferenceSource.id),
  threadId: integer("threadId").notNull().references(() => thread.id),
  type: varchar("type", { length: 255 }).notNull(),
  finishedStreaming: timestamp("finishedStreaming", {
    mode: "date",
    withTimezone: true,
  }).default(sql`NULL`),
  content: jsonb("content").$type<{
    message: string;
    jupyterData: null | {

    }
    imageId: string;
  }>().notNull(),
})

export const inferenceMessageRelations = relations(inferenceMessage, ({ one }) => ({
  inferenceSource: one(inferenceSource, { fields: [inferenceMessage.sourceId], references: [inferenceSource.id] }),
  thread: one(thread, { fields: [inferenceMessage.threadId], references: [thread.id] }),
}));

export const userMessages = createTable("userMessages", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  userId: varchar("userId", { length: 255 }).notNull().references(() => users.id),
  threadId: integer("threadId").notNull().references(() => thread.id),
  type: varchar("type", { length: 255 }).notNull(),
  content: jsonb("content").$type<{
    message: string;
    imageId: string | null;
    documentId: string | null;
  }>().notNull(),
})

export const userMessagesRelations = relations(userMessages, ({ one }) => ({
  user: one(users, { fields: [userMessages.userId], references: [users.id] }),
  thread: one(thread, { fields: [userMessages.threadId], references: [thread.id] }),
}));

export const users = createTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  inferenceProviders: many(inferenceProvider),
  threads: many(thread),
  userMessages: many(userMessages),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_userId_idx").on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
