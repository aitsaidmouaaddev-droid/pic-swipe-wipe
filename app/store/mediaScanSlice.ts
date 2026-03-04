/**
 * @file store/mediaScanSlice.ts
 */
import APP_CONFIG from "@config";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import mediaService, { AppPermissionStatus, MediaItem } from "@services/mediaService";
import * as MediaLibrary from "expo-media-library";
import { MediaVerdict } from "../database/sqlite";

export interface MediaBucket {
  items: MediaItem[];
  cursor: number;
}

export interface MediaScanState {
  permission: AppPermissionStatus;
  isScanning: boolean;
  progress: number;
  unknown: MediaBucket;
  trash: MediaBucket;
  keep: MediaBucket;
  error?: string;
}

const emptyBucket = (): MediaBucket => ({ items: [], cursor: 0 });

const initialState: MediaScanState = {
  permission: AppPermissionStatus.UNKNOWN,
  isScanning: false,
  progress: 0,
  unknown: emptyBucket(),
  trash: emptyBucket(),
  keep: emptyBucket(),
};

/* --- THUNKS --- */

export const scanDevicePhotos = createAsyncThunk(
  "mediaScan/scanDevicePhotos",
  async (_, thunkApi) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      const granted = status === "granted";

      thunkApi.dispatch(
        mediaScanSlice.actions.setPermission(
          granted ? AppPermissionStatus.GRANTED : AppPermissionStatus.DENIED,
        ),
      );

      if (!granted) return thunkApi.rejectWithValue("Permission denied");

      // On délègue TOUT le travail lourd au service
      return await mediaService.performFullScan(APP_CONFIG.media.scanLimit || 500);
    } catch (e: any) {
      return thunkApi.rejectWithValue(e?.message ?? "Scan error");
    }
  },
);

/* --- REDUCER HANDLERS (Isolés pour la lisibilité) --- */

const handleScanPending = (state: MediaScanState) => {
  state.isScanning = true;
  state.progress = 0;
};
const handleScanFulfilled = (state: MediaScanState, action: PayloadAction<any>) => {
  state.isScanning = false;
  state.unknown.items = action.payload.unknown;
  state.trash.items = action.payload.trash;
  state.keep.items = action.payload.keep;
  state.progress = 1;
};
const handleScanRejected = (state: MediaScanState, action: PayloadAction<any>) => {
  state.isScanning = false;
  state.error = action.payload;
};

/* --- SLICE --- */

export const mediaScanSlice = createSlice({
  name: "mediaScan",
  initialState,
  reducers: {
    setPermission: (state, action: PayloadAction<AppPermissionStatus>) => {
      state.permission = action.payload;
    },

    next: (state, action: PayloadAction<"unknown" | "trash" | "keep" | undefined>) => {
      const bucket = state[action.payload || "unknown"];
      if (bucket.items.length > 0) bucket.cursor = (bucket.cursor + 1) % bucket.items.length;
    },

    moveItem: (
      state,
      action: PayloadAction<{ id: string; to: MediaVerdict.KEEP | MediaVerdict.TRASH }>,
    ) => {
      const { id, to } = action.payload;
      const idx = state.unknown.items.findIndex((i) => i.id === id);
      if (idx === -1) return;

      const [item] = state.unknown.items.splice(idx, 1);
      item.verdict = to;

      const target = to === MediaVerdict.KEEP ? state.keep : state.trash;
      target.items.unshift(item);
      target.cursor = 0;

      if (state.unknown.cursor >= state.unknown.items.length) state.unknown.cursor = 0;
    },

    removePermanently: (state, action: PayloadAction<string>) => {
      state.trash.items = state.trash.items.filter((i) => i.id !== action.payload);
      if (state.trash.cursor >= state.trash.items.length)
        state.trash.cursor = Math.max(0, state.trash.items.length - 1);
    },

    restoreItem: (state, action: PayloadAction<{ id: string; from: MediaVerdict }>) => {
      const { id, from } = action.payload;
      const bucket = state[from as "trash" | "keep"];
      const idx = bucket.items.findIndex((i) => i.id === id);
      if (idx === -1) return;

      const [item] = bucket.items.splice(idx, 1);
      state.unknown.items.unshift({ ...item, verdict: MediaVerdict.UNKNOWN });
      state.unknown.cursor = 0;
    },
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
