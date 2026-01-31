import Database from "@tauri-apps/plugin-sql";
import { drizzle, TauriSQLiteDatabase } from "../../infrastructure/db/adapter";
import * as schema from "../../infrastructure/db/schema";

export class DatabaseService {
    private static instance: DatabaseService;
    private db: TauriSQLiteDatabase<typeof schema> | null = null;
    private initPromise: Promise<void> | null = null;
    private isDesktop: boolean;

    private constructor() {
        this.isDesktop = typeof window !== 'undefined' && '__TAURI__' in window;
    }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async initialize(): Promise<void> {
        if (!this.isDesktop) {
            console.warn("DatabaseService: Not running in desktop mode, skipping DB initialization");
            return;
        }

        if (this.db) return;

        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = (async () => {
            try {
                console.log("DatabaseService: Initializing SQLite...");
                const sqlite = await Database.load("sqlite:red-salud-medico.db");
                this.db = drizzle(sqlite, { schema });

                // Initialize tables if they don't exist
                // Note: Drizzle Migration involves file system access which might be tricky in Tauri directly from code
                // For this MVP, we will use raw queries to create tables if not exists, or rely on a "migration" function
                await this.ensureTables();

                console.log("DatabaseService: SQLite initialized successfully");
            } catch (error) {
                console.error("DatabaseService: Failed to initialize SQLite", error);
                this.initPromise = null; // Allow retry
                throw error;
            }
        })();

        return this.initPromise;
    }

    private async ensureTables() {
        if (!this.db) return;

        // Basic schema migration (for MVP)
        // In fully fledged app, use drizzle-kit migrate or embedded migrations
        const client = (this.db as any).session.client as Database;

        await client.execute(`
            CREATE TABLE IF NOT EXISTS doctors (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                full_name TEXT NOT NULL,
                specialty TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );
        `);

        await client.execute(`
            CREATE TABLE IF NOT EXISTS patients (
                id TEXT PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                document_id TEXT,
                synced BOOLEAN DEFAULT 0,
                last_updated INTEGER NOT NULL
            );
        `);

        await client.execute(`
            CREATE TABLE IF NOT EXISTS sync_queue (
                id TEXT PRIMARY KEY,
                table_name TEXT NOT NULL,
                record_id TEXT NOT NULL,
                operation TEXT NOT NULL,
                payload TEXT NOT NULL,
                status TEXT DEFAULT 'PENDING',
                retry_count INTEGER DEFAULT 0,
                created_at INTEGER NOT NULL
            );
        `);
    }

    public getClient() {
        if (!this.db) {
            throw new Error("Database not initialized. Call initialize() first.");
        }
        return this.db;
    }
}

export const dbService = DatabaseService.getInstance();
