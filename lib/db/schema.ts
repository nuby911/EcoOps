import { pgTable, text, timestamp, integer, doublePrecision, uuid, real, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  location: text('location').default('Indonesia'),
  points: integer('points').default(0).notNull(),
  totalCo2: doublePrecision('total_co2').default(0.0).notNull(),
  role: text('role').$type<'user' | 'admin'>().default('user').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const wasteCategories = pgTable('waste_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(), // Plastic, Paper, Organic, etc.
  pointsPerKg: integer('points_per_kg').notNull(),
  co2Multiplier: doublePrecision('co2_multiplier').default(0.1).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const wasteLogs = pgTable('waste_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  category: text('category').notNull(), // Plastic, Paper, Organic, Metal, Glass
  weight: doublePrecision('weight').notNull(),
  carbonFootprint: doublePrecision('carbon_footprint').notNull(),
  pointsEarned: integer('points_earned').notNull(),
  aiConfidenceScore: real('ai_confidence_score').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: integer('amount').notNull(), // can be points or currency
  transactionType: text('transaction_type').$type<'deposit' | 'withdrawal'>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
