/**
 * @file sqlite.ts
 * @description Gestionnaire de base de données SQLite.
 * Gère l'initialisation unique et la création du schéma pour le ledger des médias.
 */
import * as SQLite from "expo-sqlite";

/** * Verdicts possibles pour un média après un swipe.
 */
export type MediaVerdict = "trash" | "keep";

/** Instance unique de la base de données pour éviter les fuites de mémoire. */
let dbInstance: SQLite.SQLiteDatabase | null = null;
/** Promesse d'initialisation pour gérer la concurrence au démarrage. */
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Initialise la connexion et crée les tables nécessaires.
 * @internal
 * @returns {Promise<SQLite.SQLiteDatabase>} L'instance de la base de données configurée.
 */
async function internalInit(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync("picSwipeWipe.db");

  // Configuration du mode WAL pour la performance et création de la table
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS media_ledger (
      id TEXT PRIMARY KEY NOT NULL,
      verdict TEXT NOT NULL,
      scannedAt INTEGER NOT NULL
    );
  `);

  dbInstance = db;
  return db;
}

/**
 * Récupère l'instance sécurisée de la base de données.
 * @returns {Promise<SQLite.SQLiteDatabase>}
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  if (!initPromise) initPromise = internalInit();
  return initPromise;
}

/**
 * Réinitialise complètement le ledger (Utile pour le développement).
 * @returns {Promise<void>}
 */
export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM media_ledger;");
}
