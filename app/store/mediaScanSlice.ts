/**
 * @file mediaScanSlice.ts
 * @description Gère le scan exhaustif des photos et vidéos de l'appareil.
 * Intègre le filtrage via SQLite pour exclure les médias déjà traités.
 */
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import * as MediaLibrary from "expo-media-library";
import { mediaPersistenceService } from "../services/mediaPersistenceService";

/**
 * =========================
 * DEBUG HELPERS
 * =========================
 */
const DEBUG = false; // <- mets false pour couper tous les logs

const log = (...args: any[]) => {
  if (!DEBUG) return;

  console.log("[mediaScanSlice]", ...args);
};

/** Statuts de permission pour l'accès à la galerie */
export enum AppPermissionStatus {
  UNKNOWN = "unknown",
  GRANTED = "granted",
  DENIED = "denied",
}

/** Types de médias supportés par l'application */
export enum AppMediaType {
  PHOTO = "photo",
  VIDEO = "video",
}

/** Représente un média normalisé (Photo ou Vidéo) */
export interface MediaItem {
  /** Identifiant unique (MediaStore ID) */
  id: string;
  /** Nom du fichier ou fallback sur l'ID */
  name: string;
  /** Type discriminatif pour le rendu UI */
  type: AppMediaType;
  /** URI locale pour l'affichage/lecture */
  uri: string;
  /** Durée en secondes (uniquement pour les vidéos) */
  duration?: number;
}

export interface MediaScanState {
  permission: AppPermissionStatus;
  isScanning: boolean;
  progress: number;
  items: MediaItem[];
  cursor: number;
  error?: string;
}

const initialState: MediaScanState = {
  permission: AppPermissionStatus.UNKNOWN,
  isScanning: false,
  progress: 0,
  items: [],
  cursor: 0,
};

/**
 * Thunk asynchrone : Scanne les médias et filtre via SQLite.
 * @remarks
 * - Demande les permissions (Photos & Vidéos).
 * - Récupère le ledger SQLite pour le filtrage en O(1).
 * - Identifie dynamiquement le type de chaque asset.
 */
export const scanDevicePhotos = createAsyncThunk<MediaItem[], void, { rejectValue: string }>(
  "mediaScan/scanDevicePhotos",
  async (_, thunkApi) => {
    const startedAt = Date.now();
    log("THUNK scanDevicePhotos START");

    try {
      // 1) Gestion des permissions granulaires
      log("Requesting MediaLibrary permissions...");
      const perm = await MediaLibrary.requestPermissionsAsync();
      const isGranted = perm.status === "granted";

      log("Permissions result:", perm.status, perm);

      thunkApi.dispatch(
        mediaScanSlice.actions.setPermission(
          isGranted ? AppPermissionStatus.GRANTED : AppPermissionStatus.DENIED,
        ),
      );

      if (!isGranted) {
        log("THUNK ABORT: permission denied");
        return thunkApi.rejectWithValue("Permission d'accès aux médias refusée.");
      }

      // 2) Récupération du filtre SQLite
      log("Loading swipedIds from SQLite (categorized ids)...");
      const swipedIds = await mediaPersistenceService.getCategorizedIds();
      log("SQLite swipedIds size:", swipedIds?.size ?? "unknown");

      // 3) Scan de la bibliothèque (Photos + Vidéos)
      log("Scanning device assets...");
      const page = await MediaLibrary.getAssetsAsync({
        first: 500,
        // ⚠️ Tu as commenté la vidéo ici. Donc tu scans uniquement les photos actuellement.
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      });

      log("MediaLibrary page:", {
        totalAssetsReturned: page.assets?.length ?? 0,
        endCursor: (page as any)?.endCursor,
        hasNextPage: (page as any)?.hasNextPage,
      });

      // 4) Filtrage et Mapping
      const before = page.assets?.length ?? 0;
      const filtered = page.assets.filter((asset) => !swipedIds.has(asset.id));
      const after = filtered.length;

      log("Filter result:", { before, after, removed: before - after });

      const collected: MediaItem[] = filtered.map((asset) => {
        const type =
          asset.mediaType === MediaLibrary.MediaType.video
            ? AppMediaType.VIDEO
            : AppMediaType.PHOTO;

        return {
          id: asset.id,
          name: asset.filename ?? asset.id,
          type,
          uri: asset.uri,
          duration: asset.duration > 0 ? asset.duration : undefined,
        };
      });

      log("THUNK scanDevicePhotos DONE", {
        collected: collected.length,
        durationMs: Date.now() - startedAt,
        sampleFirst: collected[0]?.id,
        sampleSecond: collected[1]?.id,
      });

      return collected;
    } catch (e: any) {
      log("THUNK ERROR scanDevicePhotos:", e?.message ?? e, e);
      return thunkApi.rejectWithValue(e?.message ?? "Échec du scan des médias.");
    }
  },
);

export const mediaScanSlice = createSlice({
  name: "mediaScan",
  initialState,
  reducers: {
    setPermission: (state, action: PayloadAction<AppPermissionStatus>) => {
      log("ACTION setPermission", { from: state.permission, to: action.payload });
      state.permission = action.payload;
    },

    setProgress: (state, action: PayloadAction<number>) => {
      const next = Math.max(0, Math.min(action.payload, 1));
      log("ACTION setProgress", { from: state.progress, to: next });
      state.progress = next;
    },

    next: (state) => {
      const before = state.cursor;
      const len = state.items.length;

      log("ACTION next() called", { cursorBefore: before, len });

      if (len > 0) {
        state.cursor = (state.cursor + 1) % len;
      }

      log("ACTION next() result", { cursorAfter: state.cursor, len });
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(scanDevicePhotos.pending, (state) => {
        log("EXTRA scanDevicePhotos.pending", {
          prev: {
            isScanning: state.isScanning,
            cursor: state.cursor,
            len: state.items.length,
            progress: state.progress,
          },
        });

        state.isScanning = true;
        state.error = undefined;
        state.items = [];
        state.cursor = 0;

        log("EXTRA scanDevicePhotos.pending -> after", {
          next: {
            isScanning: state.isScanning,
            cursor: state.cursor,
            len: state.items.length,
            progress: state.progress,
          },
        });
      })

      .addCase(scanDevicePhotos.fulfilled, (state, action) => {
        log("EXTRA scanDevicePhotos.fulfilled", {
          payloadLen: action.payload.length,
          prev: {
            isScanning: state.isScanning,
            cursor: state.cursor,
            len: state.items.length,
            progress: state.progress,
          },
          sampleFirst: action.payload[0]?.id,
          sampleSecond: action.payload[1]?.id,
        });

        state.isScanning = false;
        state.items = action.payload;
        state.progress = 1;

        log("EXTRA scanDevicePhotos.fulfilled -> after", {
          next: {
            isScanning: state.isScanning,
            cursor: state.cursor,
            len: state.items.length,
            progress: state.progress,
          },
        });
      })

      .addCase(scanDevicePhotos.rejected, (state, action) => {
        log("EXTRA scanDevicePhotos.rejected", {
          payload: action.payload,
          prev: {
            isScanning: state.isScanning,
            cursor: state.cursor,
            len: state.items.length,
            progress: state.progress,
          },
        });

        state.isScanning = false;
        state.error = action.payload;

        log("EXTRA scanDevicePhotos.rejected -> after", {
          next: {
            isScanning: state.isScanning,
            cursor: state.cursor,
            len: state.items.length,
            progress: state.progress,
            error: state.error,
          },
        });
      });
  },
});

export const mediaScanActions = mediaScanSlice.actions;
export default mediaScanSlice.reducer;
