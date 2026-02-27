/**
 * @file useMedia.hook.ts
 * @description Hook gérant les actions sur les médias et la persistance SQLite.
 */
import { useCallback } from "react";
import { mediaPersistenceService } from "../services/mediaPersistenceService";
import { useAppDispatch } from "../store/hooks";
import { mediaScanActions } from "../store/mediaScanSlice";

export const useMedia = () => {
  const dispatch = useAppDispatch();

  /**
   * Enregistre la décision et passe à l'image suivante.
   * @param assetId - L'ID de la photo/vidéo.
   * @param direction - 'left' (trash) ou 'right' (keep).
   */
  const handleSwipeCommit = useCallback(
    async (assetId: string, direction: "left" | "right") => {
      try {
        const verdict = direction === "right" ? "keep" : "trash";

        // 1. Sauvegarde en base de données
        await mediaPersistenceService.recordDecision(assetId, verdict);
        console.log(`✅ Saved to SQLite: ${assetId} as ${verdict}`);

        // 2. Avance le curseur Redux pour la carte suivante
        dispatch(mediaScanActions.next());
      } catch (error) {
        console.error("❌ Failed to save decision:", error);
      }
    },
    [dispatch],
  );

  return { handleSwipeCommit };
};
