/**
 * @file sqlite.ts
 * @description SQLite database manager with centralized table names.
 */
import * as SQLite from "expo-sqlite";

/** * Table Names Constants
 * Centralized here to avoid "no such table" errors in services.
 */
export const MEDIA_LEDGER_TABLE = "media_ledger";

/** * Possible verdicts for a media after a swipe. */
export enum MediaVerdict {
  UNKNOWN = "unknown",
  KEEP = "keep",
  TRASH = "trash",
}

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Initializes the connection and creates the necessary tables.
 * @internal
 */
async function internalInit(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync("picSwipeWipe.db");

  // Configuration using the exported constant
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS ${MEDIA_LEDGER_TABLE} (
      id TEXT PRIMARY KEY NOT NULL,
      verdict TEXT NOT NULL,
      scannedAt INTEGER NOT NULL
    );
  `);

  dbInstance = db;
  return db;
}

/**
 * Retrieves the secured database instance.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  if (!initPromise) initPromise = internalInit();
  return initPromise;
}

/**
 * Fully resets the ledger.
 */
export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM ${MEDIA_LEDGER_TABLE};`);
}

// Default export containing all members
export default {
  resetDatabase,
  getDatabase,
  MediaVerdict,
  MEDIA_LEDGER_TABLE,
};
