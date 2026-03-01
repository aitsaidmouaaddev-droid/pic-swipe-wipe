/**
 * @file mediaScanSlice.ts
 * @description
 * Slice Redux Toolkit responsable du scan des médias (Photos + Vidéos) via Expo MediaLibrary.
 * Intègre un filtrage via SQLite pour exclure les médias déjà catégorisés (swipés/traités).
 *
 * Objectifs
 * - Demander l'autorisation d'accès à la galerie (MediaLibrary).
 * - Scanner les assets de type photo + vidéo en une seule passe.
 * - Charger le ledger SQLite des médias déjà catégorisés (Map id -> verdict).
 * - Filtrer les assets déjà connus (Map.has(id)).
 * - Normaliser les assets en `MediaItem[]` utilisables facilement dans l’UI.
 * - Gérer un "deck" avec curseur circulaire (next()).
 *
 * Design
 * - Toutes les fonctions reducers sont définies hors du createSlice (lisibilité/testabilité).
 * - Tous les handlers d'extraReducers sont définis hors du builder.
 * - Une constante `MEDIA_SCAN_LIMIT` centralise la taille du scan.
 */

import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import * as MediaLibrary from "expo-media-library";
import { mediaPersistenceService } from "../services/mediaPersistenceService";

/* ============================================================
 * CONFIGURATION
 * ============================================================ */

/**
 * Nombre maximum d'assets récupérés lors d'un scan.
 * ⚠️ Pagination possible dans le futur.
 */
const MEDIA_SCAN_LIMIT = 500;

/**
 * Active/désactive tous les logs debug.
 */
const DEBUG = false;

const log = (...args: any[]) => {
  if (!DEBUG) return;

  console.log("[mediaScanSlice]", ...args);
};

/* ============================================================
 * TYPES
 * ============================================================ */

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

/**
 * Représente un média normalisé (Photo ou Vidéo) prêt pour l'UI.
 */
export interface MediaItem {
  /** Identifiant unique (MediaStore/Photos ID) */
  id: string;
  /** Nom du fichier ou fallback sur l'ID */
  name: string;
  /** Type discriminant (photo/vidéo) */
  type: AppMediaType;
  /** URI locale pour l'affichage/lecture */
  uri: string;
  /** Durée (secondes) uniquement pour les vidéos */
  duration?: number;
}

/**
 * State global de scan média + deck.
 */
export interface MediaScanState {
  permission: AppPermissionStatus;
  isScanning: boolean;
  /** Progression normalisée [0..1] */
  progress: number;
  /** Deck d'items prêts à être parcourus */
  items: MediaItem[];
  /** Index courant dans le deck */
  cursor: number;
  /** Message d'erreur en cas d'échec */
  error?: string;
}

const initialState: MediaScanState = {
  permission: AppPermissionStatus.UNKNOWN,
  isScanning: false,
  progress: 0,
  items: [],
  cursor: 0,
  error: undefined,
};

/**
 * Typage minimal du verdict (pour compatibilité).
 * Si tu as un type exporté côté `mediaPersistenceService`, remplace ceci par l'import officiel.
 */

type MediaVerdict = any;

/* ============================================================
 * INTERNAL HELPERS
 * ============================================================ */

/**
 * Demande la permission MediaLibrary et renvoie `true` si accordée.
 */
async function requestGalleryPermission(): Promise<boolean> {
  log("Requesting MediaLibrary permission...");
  const perm = await MediaLibrary.requestPermissionsAsync();
  const granted = perm.status === "granted";
  log("Permission result:", { status: perm.status, granted, raw: perm });
  return granted;
}

/**
 * Charge le ledger SQLite des médias déjà catégorisés.
 *
 * Pourquoi une Map ?
 * - Le service persiste des infos "id -> verdict" (like/dislike/etc).
 * - Pour le scan, on a surtout besoin de `has(id)`.
 * - Garder la Map permet d'évoluer plus tard (ex: analytics par verdict).
 */
async function loadCategorizedVerdicts(): Promise<Map<string, MediaVerdict>> {
  log("Loading categorized verdicts from SQLite...");
  const verdictsMap = await mediaPersistenceService.getCategorizedIds(); // Map<string, MediaVerdict>
  log("Loaded categorized verdicts:", { size: verdictsMap?.size ?? 0 });
  return verdictsMap ?? new Map<string, MediaVerdict>();
}

/**
 * Récupère les assets depuis MediaLibrary (Photos + Vidéos).
 */
async function fetchDeviceAssets(): Promise<MediaLibrary.PagedInfo<MediaLibrary.Asset>> {
  log("Fetching assets from MediaLibrary...", { limit: MEDIA_SCAN_LIMIT });

  const page = await MediaLibrary.getAssetsAsync({
    first: MEDIA_SCAN_LIMIT,
    mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
    sortBy: [[MediaLibrary.SortBy.creationTime, false]],
  });

  log("MediaLibrary page fetched:", {
    totalAssetsReturned: page.assets?.length ?? 0,
    endCursor: (page as any)?.endCursor,
    hasNextPage: (page as any)?.hasNextPage,
  });

  return page;
}

/**
 * Détermine le type de MediaItem à partir du mediaType Expo.
 */
function resolveMediaType(asset: MediaLibrary.Asset): AppMediaType {
  return asset.mediaType === MediaLibrary.MediaType.video ? AppMediaType.VIDEO : AppMediaType.PHOTO;
}

/**
 * Transforme un asset Expo en MediaItem normalisé.
 */
function mapAssetToMediaItem(asset: MediaLibrary.Asset): MediaItem {
  const type = resolveMediaType(asset);

  return {
    id: asset.id,
    name: asset.filename ?? asset.id,
    type,
    uri: asset.uri,
    duration: asset.duration > 0 ? asset.duration : undefined,
  };
}

/**
 * Filtre les assets déjà traités (présents dans SQLite).
 */
function filterAlreadyCategorizedAssets(
  assets: MediaLibrary.Asset[],
  categorizedVerdicts: Map<string, MediaVerdict>,
): MediaLibrary.Asset[] {
  const before = assets.length;
  const filtered = assets.filter((asset) => !categorizedVerdicts.has(asset.id));
  const after = filtered.length;

  log("Filter result:", { before, after, removed: before - after });

  return filtered;
}

/**
 * Construit la liste finale MediaItem[] :
 * - filtrage via SQLite
 * - mapping vers MediaItem
 */
function buildMediaItems(
  page: MediaLibrary.PagedInfo<MediaLibrary.Asset>,
  categorizedVerdicts: Map<string, MediaVerdict>,
): MediaItem[] {
  const assets = page.assets ?? [];
  const filtered = filterAlreadyCategorizedAssets(assets, categorizedVerdicts);
  const items = filtered.map(mapAssetToMediaItem);

  log("BuildMediaItems summary:", {
    assets: assets.length,
    kept: items.length,
    sample: items.slice(0, 3).map((x) => ({ id: x.id, type: x.type, name: x.name })),
  });

  return items;
}

/* ============================================================
 * THUNK
 * ============================================================ */

/**
 * @async
 * @function scanDevicePhotos
 * @description
 * Scanne la galerie (photos + vidéos), filtre les éléments déjà traités (SQLite),
 * et renvoie une liste `MediaItem[]` normalisée pour l'UI.
 *
 * Étapes
 * 1) Permission MediaLibrary
 * 2) Chargement ledger SQLite (Map id -> verdict)
 * 3) Scan MediaLibrary (limit = MEDIA_SCAN_LIMIT)
 * 4) Filtre + mapping
 *
 * @example
 * dispatch(scanDevicePhotos());
 *
 * @returns {Promise<MediaItem[]>} Liste de médias prêts à être affichés dans le deck.
 * @throws {string} Message d'erreur (rejectValue) si permission refusée / scan échoue.
 */
export const scanDevicePhotos = createAsyncThunk<MediaItem[], void, { rejectValue: string }>(
  "mediaScan/scanDevicePhotos",
  async (_, thunkApi) => {
    const startedAt = Date.now();
    log("THUNK scanDevicePhotos START");

    try {
      // 1) Permission
      const granted = await requestGalleryPermission();

      thunkApi.dispatch(
        mediaScanSlice.actions.setPermission(
          granted ? AppPermissionStatus.GRANTED : AppPermissionStatus.DENIED,
        ),
      );

      if (!granted) {
        log("THUNK ABORT: permission denied");
        return thunkApi.rejectWithValue("Permission d'accès aux médias refusée.");
      }

      // 2) Ledger SQLite (id -> verdict)
      const categorizedVerdicts = await loadCategorizedVerdicts();

      // 3) Scan device assets
      const page = await fetchDeviceAssets();

      // 4) Filter + map
      const collected = buildMediaItems(page, categorizedVerdicts);

      log("THUNK scanDevicePhotos DONE", {
        collected: collected.length,
        durationMs: Date.now() - startedAt,
      });

      return collected;
    } catch (e: any) {
      log("THUNK ERROR scanDevicePhotos:", e?.message ?? e, e);
      return thunkApi.rejectWithValue(e?.message ?? "Échec du scan des médias.");
    }
  },
);

/* ============================================================
 * REDUCERS (DECLARED OUTSIDE)
 * ============================================================ */

function setPermission(state: MediaScanState, action: PayloadAction<AppPermissionStatus>) {
  log("ACTION setPermission", { from: state.permission, to: action.payload });
  state.permission = action.payload;
}

function setProgress(state: MediaScanState, action: PayloadAction<number>) {
  const next = Math.max(0, Math.min(action.payload, 1));
  log("ACTION setProgress", { from: state.progress, to: next });
  state.progress = next;
}

/**
 * Avance le curseur dans le deck (circular).
 * - si aucun item, ne fait rien
 */
function next(state: MediaScanState) {
  const len = state.items.length;
  const before = state.cursor;

  log("ACTION next()", { cursorBefore: before, len });

  if (len > 0) {
    state.cursor = (state.cursor + 1) % len;
  }

  log("ACTION next() result", { cursorAfter: state.cursor, len });
}

/* ============================================================
 * EXTRA REDUCERS HANDLERS (DECLARED OUTSIDE)
 * ============================================================ */

function handleScanPending(state: MediaScanState) {
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
  state.progress = 0;

  log("EXTRA scanDevicePhotos.pending -> after", {
    next: {
      isScanning: state.isScanning,
      cursor: state.cursor,
      len: state.items.length,
      progress: state.progress,
    },
  });
}

function handleScanFulfilled(state: MediaScanState, action: PayloadAction<MediaItem[]>) {
  log("EXTRA scanDevicePhotos.fulfilled", {
    payloadLen: action.payload.length,
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
}

function handleScanRejected(state: MediaScanState, action: PayloadAction<string | undefined>) {
  log("EXTRA scanDevicePhotos.rejected", { payload: action.payload });

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
}

/* ============================================================
 * SLICE
 * ============================================================ */

export const mediaScanSlice = createSlice({
  name: "mediaScan",
  initialState,
  reducers: {
    setPermission,
    setProgress,
    next,
  },
  extraReducers: (builder) => {
    builder
      .addCase(scanDevicePhotos.pending, handleScanPending)
      .addCase(scanDevicePhotos.fulfilled, handleScanFulfilled)
      .addCase(scanDevicePhotos.rejected, handleScanRejected);
  },
});

export const mediaScanActions = mediaScanSlice.actions;
export default mediaScanSlice.reducer;
