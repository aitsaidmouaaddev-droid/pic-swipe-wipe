/**
 * @file useMedia.hook.ts
 * @description Hook gérant les actions sur les médias, la persistance SQLite et la mise à jour Redux.
 */
import * as MediaLibrary from "expo-media-library";
import { useCallback } from "react";
import { MediaVerdict } from "../database/sqlite";
import mediaService from "../services/mediaService";
import { mediaScanActions } from "../store/mediaScanSlice"; // Import des actions et de l'enum
import { useAppDispatch } from "./store.hook";

const useMedia = () => {
  const dispatch = useAppDispatch();

  /**
   * Enregistre la décision en base de données et déplace l'item dans le store Redux.
   * @param assetId - L'ID unique du média.
   * @param direction - 'left' (vers Trash) ou 'right' (vers Keep).
   */
  const handleSwipeCommit = useCallback(
    async (assetId: string, direction: "left" | "right") => {
      try {
        // 1. Détermination du verdict
        const verdict = direction === "right" ? MediaVerdict.KEEP : MediaVerdict.TRASH;

        // 2. Persistance physique (SQLite)
        // On s'assure que le service reçoit la valeur string de l'enum ("keep" ou "trash")
        await mediaService.recordDecision(assetId, verdict);

        // 3. Mise à jour de l'état global (Redux)
        // moveItem va retirer l'élément de 'unknown' et l'ajouter dans le bac correspondant
        dispatch(
          mediaScanActions.moveItem({
            id: assetId,
            to: verdict,
          }),
        );
      } catch (error) {
        console.error("❌ Failed to commit swipe decision:", error);
      }
    },
    [dispatch],
  );

  const restore = useCallback(
    async (assetId: string, verdict: MediaVerdict) => {
      try {
        // 1. On remet à jour SQLite (verdict = unknown)
        await mediaService.recordDecision(assetId, MediaVerdict.UNKNOWN);

        // 2. On déplace dans Redux
        dispatch(mediaScanActions.restoreItem({ id: assetId, from: verdict }));
      } catch (error) {
        console.error("❌ Erreur restauration:", error);
      }
    },
    [dispatch],
  );

  /**
   * 🗑️ Suppression définitive d'un SEUL média (celui en cours)
   */
  const deletePermanently = async (assetId: string) => {
    try {
      // 1. Demande de suppression à l'OS (Affiche la popup native)
      const success = await MediaLibrary.deleteAssetsAsync([assetId]);

      if (success) {
        // 2. Supprimer de la base de données SQLite
        await mediaService.deleteEntries([assetId]);

        // 3. Retirer l'élément du store Redux (dans le bucket trash)
        dispatch(mediaScanActions.removePermanently(assetId));
      }
    } catch (error) {
      console.error("Failed to delete asset permanently:", error);
    }
  };

  return { handleSwipeCommit, restore, deletePermanently };
};

export default useMedia;
