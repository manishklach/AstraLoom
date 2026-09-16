import {integer, sqliteTable, text, uniqueIndex} from 'drizzle-orm/sqlite-core';
import {sql} from 'drizzle-orm';
export const birthProfiles=sqliteTable('birth_profiles',{id:integer('id').primaryKey({autoIncrement:true}),userId:text('user_id').notNull(),label:text('label').notNull(),birthData:text('birth_data',{mode:'json'}).notNull(),createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),updatedAt:text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)},table=>[uniqueIndex('idx_birth_profiles_user_label').on(table.userId,table.label)]);
