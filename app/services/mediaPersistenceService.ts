/**
 * @file mediaPersistenceService.ts
 * @description Service de persistance pour les décisions utilisateur (Keep/Trash).
 */
import { getDatabase, MediaVerdict } from "../database/sqlite";

/** Structure d'une ligne de décision en base. */
export interface MediaDecisionRow {
  id: string;
  verdict: MediaVerdict;
}

export const mediaPersistenceService = {
  /**
   * Enregistre le verdict d'un média dans SQLite.
   * @param id - Identifiant unique du média (MediaStore ID).
   * @param verdict - Résultat du swipe ('trash' ou 'keep').
   */
  async recordDecision(id: string, verdict: MediaVerdict): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      "INSERT OR REPLACE INTO media_ledger (id, verdict, scannedAt) VALUES (?, ?, ?)",
      [id, verdict, Date.now()],
    );
  },

  /**
   * Récupère tous les médias déjà traités sous forme de Map pour un accès rapide (O(1)).
   * Utilisé pour filtrer le scan des photos.
   * @returns {Promise<Map<string, MediaVerdict>>}
   */
  async getCategorizedIds(): Promise<Map<string, MediaVerdict>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<MediaDecisionRow>("SELECT id, verdict FROM media_ledger");

    const ledgerMap = new Map<string, MediaVerdict>();
    rows.forEach((row) => ledgerMap.set(row.id, row.verdict));
    return ledgerMap;
  },
};
