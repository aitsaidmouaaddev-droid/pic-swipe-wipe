/**
 * @file mediaPersistenceService.ts
 * @description Service de persistance pour les décisions utilisateur (Keep/Trash).
 */
import * as MediaLibrary from "expo-media-library";
import { getDatabase, MEDIA_LEDGER_TABLE, MediaVerdict } from "../database/sqlite";

export enum AppMediaType {
  PHOTO = "photo",
  VIDEO = "video",
}

export interface MediaItem {
  id: string;
  name: string;
  type: AppMediaType;
  uri: string;
  duration?: number;
  verdict: MediaVerdict;
}

export enum AppPermissionStatus {
  UNKNOWN = "unknown",
  GRANTED = "granted",
  DENIED = "denied",
}

/** Structure d'une ligne de décision en base. */
export interface MediaDecisionRow {
  id: string;
  verdict: MediaVerdict;
}

export const mediaService = {
  /**
   * Enregistre le verdict d'un média dans SQLite.
   * @param id - Identifiant unique du média (MediaStore ID).
   * @param verdict - Résultat du swipe ('trash' ou 'keep').
   */
  async recordDecision(id: string, verdict: MediaVerdict): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      "INSERT OR REPLACE INTO " + MEDIA_LEDGER_TABLE + " (id, verdict, scannedAt) VALUES (?, ?, ?)",
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
    const rows = await db.getAllAsync<MediaDecisionRow>(
      "SELECT id, verdict FROM " + MEDIA_LEDGER_TABLE,
    );

    const ledgerMap = new Map<string, MediaVerdict>();
    rows.forEach((row) => ledgerMap.set(row.id, row.verdict));
    return ledgerMap;
  },

  /**
   * 🗑️ Supprime définitivement les entrées de la base de données.
   */
  deleteEntries: async (assetIds: string[]): Promise<void> => {
    if (assetIds.length === 0) return;

    // On prépare les points d'interrogation pour la requête IN (?, ?, ...)
    const placeholders = assetIds.map(() => "?").join(",");
    const query = "DELETE FROM " + MEDIA_LEDGER_TABLE + " WHERE id IN (" + placeholders + ")";

    try {
      const db = await getDatabase(); // Ta fonction d'accès à SQLite
      await db.runAsync(query, assetIds);
    } catch (error) {
      console.error("[SQLite] Error deleting entries:", error);
      throw error;
    }
  },

  /**
   * Orchestre le scan complet : Permissions -> Galerie -> SQLite -> Mapping
   */
  async performFullScan(limit: number): Promise<{
    unknown: MediaItem[];
    trash: MediaItem[];
    keep: MediaItem[];
  }> {
    // 1. Fetch Galerie
    const page = await MediaLibrary.getAssetsAsync({
      first: limit,
      mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });

    // 2. Fetch SQLite Verdicts
    const verdictsMap = await this.getCategorizedIds();

    // 3. Mapping et Catégorisation
    const result = { unknown: [], trash: [], keep: [] } as any;

    page.assets.forEach((asset) => {
      const verdict = verdictsMap.get(asset.id) || MediaVerdict.UNKNOWN;

      // Transformation (Anciennement mapAssetToMediaItem)
      const item: MediaItem = {
        id: asset.id,
        name: asset.filename ?? asset.id,
        type:
          asset.mediaType === MediaLibrary.MediaType.video
            ? AppMediaType.VIDEO
            : AppMediaType.PHOTO,
        uri: asset.uri,
        duration: asset.duration > 0 ? asset.duration : undefined,
        verdict,
      };

      if (verdict === MediaVerdict.UNKNOWN) result.unknown.push(item);
      else if (verdict === MediaVerdict.TRASH) result.trash.push(item);
      else if (verdict === MediaVerdict.KEEP) result.keep.push(item);
    });

    return result;
  },
};

export default mediaService;
