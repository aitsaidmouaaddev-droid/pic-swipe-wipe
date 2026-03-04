import mediaService from "@services/mediaService";
import { mediaScanActions } from "@store/mediaScanSlice";
import { renderHook } from "@testing-library/react-native";
import * as MediaLibrary from "expo-media-library";
import { MediaVerdict } from "../database/sqlite";
import useMedia from "./media.hook";
import { useAppDispatch } from "./store.hook";

jest.mock("@services/mediaService", () => ({
  __esModule: true,
  default: {
    // ✅ On force le retour d'une promesse résolue pour éviter que l'await ne bloque
    recordDecision: jest.fn().mockResolvedValue(undefined),
    deleteEntries: jest.fn().mockResolvedValue(undefined),
  },
  AppPermissionStatus: {
    UNKNOWN: "unknown",
    GRANTED: "granted",
    DENIED: "denied",
  },
}));

jest.mock("./store.hook", () => ({
  useAppDispatch: jest.fn(),
}));

describe("useMedia hook", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    // ✅ On s'assure que le mock est prêt pour chaque test
    (mediaService.recordDecision as jest.Mock).mockResolvedValue(undefined);
  });

  describe("handleSwipeCommit", () => {
    it("devrait enregistrer KEEP et dispatcher moveItem lors d'un swipe 'right'", async () => {
      const { result } = renderHook(() => useMedia());
      const assetId = "123";

      await result.current.handleSwipeCommit(assetId, "right");

      expect(mediaService.recordDecision).toHaveBeenCalledWith(assetId, MediaVerdict.KEEP);
      expect(mockDispatch).toHaveBeenCalledWith(
        mediaScanActions.moveItem({ id: assetId, to: MediaVerdict.KEEP }),
      );
    });

    it("devrait enregistrer TRASH et dispatcher moveItem lors d'un swipe 'left'", async () => {
      const { result } = renderHook(() => useMedia());
      const assetId = "456";

      await result.current.handleSwipeCommit(assetId, "left");

      expect(mediaService.recordDecision).toHaveBeenCalledWith(assetId, MediaVerdict.TRASH);
      expect(mockDispatch).toHaveBeenCalledWith(
        mediaScanActions.moveItem({ id: assetId, to: MediaVerdict.TRASH }),
      );
    });

    it("devrait logger une erreur si le service SQLite échoue", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      (mediaService.recordDecision as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const { result } = renderHook(() => useMedia());
      await result.current.handleSwipeCommit("123", "right");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to commit"),
        expect.any(Error),
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe("restore", () => {
    it("devrait remettre le verdict à UNKNOWN et dispatcher restoreItem", async () => {
      const { result } = renderHook(() => useMedia());
      const assetId = "789";

      // ✅ On appelle restore
      await result.current.restore(assetId, MediaVerdict.TRASH);

      // ✅ Vérification 1 : Le service SQLite a été appelé
      expect(mediaService.recordDecision).toHaveBeenCalledWith(assetId, MediaVerdict.UNKNOWN);

      // ✅ Vérification 2 : Le dispatch Redux a été déclenché
      expect(mockDispatch).toHaveBeenCalledWith(
        mediaScanActions.restoreItem({ id: assetId, from: MediaVerdict.TRASH }),
      );
    });
  });

  describe("deletePermanently", () => {
    it("devrait supprimer de l'OS, de SQLite et de Redux si l'utilisateur accepte", async () => {
      (MediaLibrary.deleteAssetsAsync as jest.Mock).mockResolvedValue(true);
      const { result } = renderHook(() => useMedia());
      const assetId = "999";

      await result.current.deletePermanently(assetId);

      expect(MediaLibrary.deleteAssetsAsync).toHaveBeenCalledWith([assetId]);
      expect(mediaService.deleteEntries).toHaveBeenCalledWith([assetId]);
      expect(mockDispatch).toHaveBeenCalledWith(mediaScanActions.removePermanently(assetId));
    });

    it("ne devrait rien faire si l'utilisateur refuse la popup native (OS retourne false)", async () => {
      (MediaLibrary.deleteAssetsAsync as jest.Mock).mockResolvedValue(false);
      const { result } = renderHook(() => useMedia());

      await result.current.deletePermanently("999");

      expect(MediaLibrary.deleteAssetsAsync).toHaveBeenCalled();
      expect(mediaService.deleteEntries).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("devrait attraper les erreurs inattendues (ex: crash MediaLibrary)", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      (MediaLibrary.deleteAssetsAsync as jest.Mock).mockRejectedValue(new Error("OS Crash"));

      const { result } = renderHook(() => useMedia());
      await result.current.deletePermanently("999");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to delete"),
        expect.any(Error),
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
