import { Action, Transaction } from "drizzle-orm";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { type Logger } from "drizzle-orm/logger";
import { type RelationalSchemaConfig, type TablesRelationalConfig } from "drizzle-orm/relations";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import Database from "@tauri-apps/plugin-sql";

export class TauriSQLiteSession {
    constructor(
        private client: Database,
        private schema: RelationalSchemaConfig<TablesRelationalConfig> | undefined,
        private logger?: Logger
    ) { }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async run(query: { sql: string; params: any[] }): Promise<any> {
        this.logger?.logQuery(query.sql, query.params);
        return this.client.execute(query.sql, query.params);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async all(query: { sql: string; params: any[] }): Promise<any[]> {
        this.logger?.logQuery(query.sql, query.params);
        return this.client.select(query.sql, query.params);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async get(query: { sql: string; params: any[] }): Promise<any> {
        this.logger?.logQuery(query.sql, query.params);
        const rows = await this.client.select<any[]>(query.sql, query.params);
        return rows[0];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async values(query: { sql: string; params: any[] }): Promise<any[]> {
        this.logger?.logQuery(query.sql, query.params);
        const rows = await this.client.select<any[]>(query.sql, query.params);
        return rows.map(row => Object.values(row));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async transaction<T>(transaction: (tx: TauriSQLiteTransaction) => Promise<T>, config?: { behavior: "immediate" | "deferred" | "exclusive" }): Promise<T> {
        // Simple transaction support for now
        // Tauri plugin sql doesn't expose low level transaction control easily without execute
        await this.client.execute("BEGIN TRANSACTION");
        try {
            const tx = new TauriSQLiteTransaction("sqlite", this.schema, this);
            const result = await transaction(tx);
            await this.client.execute("COMMIT");
            return result;
        } catch (e) {
            await this.client.execute("ROLLBACK");
            throw e;
        }
    }
}

export class TauriSQLiteTransaction extends SQLiteTransaction<"async", void> {
    constructor(
        dialect: "sqlite",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schema: RelationalSchemaConfig<TablesRelationalConfig> | undefined,
        private session: TauriSQLiteSession
    ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        super(dialect, session as any, schema as any);
    }

    async transaction<T>(transaction: (tx: TauriSQLiteTransaction) => Promise<T>): Promise<T> {
        return this.session.transaction(transaction);
    }
}

export class TauriSQLiteDatabase<TSchema extends Record<string, unknown> = Record<string, never>> extends BaseSQLiteDatabase<"async", void, TSchema> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(client: Database, schema: TSchema | undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        super("sqlite", new TauriSQLiteSession(client, schema as any, undefined) as any, schema as any);
    }
}

// Factory function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function drizzle<TSchema extends Record<string, unknown> = Record<string, never>>(client: Database, config: { schema?: TSchema, logger?: boolean } = {}): TauriSQLiteDatabase<TSchema> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new TauriSQLiteDatabase(client, config.schema) as any;
}
