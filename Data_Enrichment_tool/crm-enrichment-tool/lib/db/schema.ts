import { pgTable, uuid, varchar, timestamp, integer, jsonb, boolean, decimal } from 'drizzle-orm/pg-core'

// Users (NextAuth)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  image: varchar('image', { length: 500 }),
  emailVerified: timestamp('email_verified'),
  createdAt: timestamp('created_at').defaultNow(),
})

// NextAuth Sessions
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: varchar('session_token', { length: 500 }).notNull().unique(),
  expires: timestamp('expires').notNull(),
})

// NextAuth Accounts
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refresh_token: varchar('refresh_token', { length: 500 }),
  access_token: varchar('access_token', { length: 500 }),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: varchar('id_token', { length: 2000 }),
  session_state: varchar('session_state', { length: 255 }),
})

// Verification Tokens
export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: timestamp('expires').notNull(),
})

// CRM Projects
export const crmProjects = pgTable('crm_projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),

  // File references (Vercel Blob URLs)
  crmFileUrl: varchar('crm_file_url', { length: 500 }),
  crmFileName: varchar('crm_file_name', { length: 255 }),
  crmRowCount: integer('crm_row_count'),
  qualitativeFiles: jsonb('qualitative_files').$type<{
    url: string
    name: string
    type: string
    size: number
  }[]>(),

  // Configuration
  columnMapping: jsonb('column_mapping').$type<Record<string, string>>(),
  socialApiConfig: jsonb('social_api_config').$type<{
    forumscout?: {
      enabled: boolean
      endpoints: Record<string, boolean>
    }
    instagram_direct?: { enabled: boolean }
    tiktok_direct?: { enabled: boolean }
    reddit_direct?: { enabled: boolean }
  }>(),

  // Status
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  // draft, analyzing_crm, processing_qualitative, social_enrichment, generating_personas, completed, error

  // Results
  clusters: jsonb('clusters').$type<Array<{
    id: string
    name: string
    size: number
    percentage: number
    behavioral_traits: Record<string, any>
    demographic_traits?: Record<string, any>
  }>>(),

  enrichedClusters: jsonb('enriched_clusters'),

  personas: jsonb('personas').$type<Array<{
    id: string
    name: string
    age: number
    emoji: string
    occupation: string
    prompt: string
  }>>(),

  summary: varchar('summary', { length: 2000 }),

  // Error tracking
  errorLog: jsonb('error_log'),
})

// API Keys (encrypted)
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 100 }).notNull(), // forumscout, instagram_api, etc.
  apiKeyEncrypted: varchar('api_key_encrypted', { length: 500 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  lastUsedAt: timestamp('last_used_at'),
  isActive: boolean('is_active').default(true),
})

// API Usage Tracking
export const apiUsage = pgTable('api_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => crmProjects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  timestamp: timestamp('timestamp').defaultNow(),

  provider: varchar('provider', { length: 100 }).notNull(), // forumscout, instagram_api, etc.
  endpoint: varchar('endpoint', { length: 100 }), // forum_search, reddit, etc.
  requestsCount: integer('requests_count').default(1),
  costUsd: decimal('cost_usd', { precision: 10, scale: 4 }),

  success: boolean('success').default(true),
  errorMessage: varchar('error_message', { length: 1000 }),
  metadata: jsonb('metadata'), // Query details, response size, etc.
})

// Type exports
export type User = typeof users.$inferSelect
export type Session = typeof sessions.$inferSelect
export type CrmProject = typeof crmProjects.$inferSelect
export type ApiKey = typeof apiKeys.$inferSelect
export type ApiUsage = typeof apiUsage.$inferSelect
