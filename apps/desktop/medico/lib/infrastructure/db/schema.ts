import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const doctors = sqliteTable('doctors', {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    fullName: text('full_name').notNull(),
    specialty: text('specialty'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const patients = sqliteTable('patients', {
    id: text('id').primaryKey(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email'),
    phone: text('phone'),
    documentId: text('document_id'),
    synced: integer('synced', { mode: 'boolean' }).default(false),
    lastUpdated: integer('last_updated', { mode: 'timestamp' }).notNull(),
});

export const syncQueue = sqliteTable('sync_queue', {
    id: text('id').primaryKey(),
    tableName: text('table_name').notNull(),
    recordId: text('record_id').notNull(),
    operation: text('operation').notNull(), // 'INSERT', 'UPDATE', 'DELETE'
    payload: text('payload').notNull(), // JSON string
    status: text('status').default('PENDING'), // 'PENDING', 'PROCESSING', 'FAILED'
    retryCount: integer('retry_count').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
