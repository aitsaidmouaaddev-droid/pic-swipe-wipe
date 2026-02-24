import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import * as MediaLibrary from "expo-media-library";

/**
 * Represents a normalized photo object for the application.
 */
export interface MediaItem {
  /** The unique ID assigned by the device's MediaLibrary */
  id: string;
  /** The original filename or the ID as a fallback */
  name: string;
  /** Restricted to "photo" for this specific slice logic */
  type: "photo";
  /** The local URI string used to display the image */
  uri: string;
}

/**
 * State shape for the media scanning process.
 */
export interface MediaScanState {
  /** User authorization status for library access */
  permission: "unknown" | "granted" | "denied";
  /** True if the async thunk is currently executing */
  isScanning: boolean;
  /** Progression value from 0 to 1 */
  progress: number;
  /** Array of found MediaItems */
  items: MediaItem[];
  /** The current index used for deck/carousel navigation */
  cursor: number;
  /** Captures potential system errors during library access */
  error?: string;
}

const initialState: MediaScanState = {
  permission: "unknown",
  isScanning: false,
  progress: 0,
  items: [],
  cursor: 0,
};

/**
 * Async thunk that handles the full workflow of scanning device photos.
 * * @remarks
 * 1. Requests permissions from the user.
 * 2. Pages through the library using `pageSize` (200) to optimize memory usage.
 * 3. Calculates progress based on the `totalCount` field (if available on the platform).
 * * @returns {Promise<MediaItem[]>} A flat list of all photos found.
 * @throws {string} Error message on permission denial or library failure.
 */
export const scanDevicePhotos = createAsyncThunk<
  MediaItem[],
  void,
  { rejectValue: string }
>("mediaScan/scanDevicePhotos", async (_, thunkApi) => {
  try {
    // 1) Permission handling
    const perm = await MediaLibrary.requestPermissionsAsync();
    const granted = perm.status === "granted";
    thunkApi.dispatch(
      mediaScanSlice.actions.setPermission(granted ? "granted" : "denied")
    );

    if (!granted) return thunkApi.rejectWithValue("Media permission denied");

    // 2) Page through photos
    const pageSize = 200;
    let after: string | undefined = undefined;
    let hasNextPage = true;

    const collected: MediaItem[] = [];
    let totalCount = 0;

    while (hasNextPage) {
      const page = await MediaLibrary.getAssetsAsync({
        first: pageSize,
        after,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        mediaType: [MediaLibrary.MediaType.photo], // ✅ photos only
      });

      // Platform check: totalCount is primarily available on Android
      if (!totalCount && typeof (page as any).totalCount === "number") {
        totalCount = (page as any).totalCount;
      }

      for (const a of page.assets) {
        collected.push({
          id: a.id,
          name: a.filename ?? a.id,
          type: "photo",
          uri: a.uri,
        });
      }

      after = page.endCursor ?? undefined;
      hasNextPage = page.hasNextPage;

      // 3) Update real-time progress
      if (totalCount > 0) {
        thunkApi.dispatch(mediaScanSlice.actions.setProgress(collected.length / totalCount));
      }
    }

    // Finalize progress bar
    thunkApi.dispatch(mediaScanSlice.actions.setProgress(1));

    return collected;
  } catch (e: any) {
    return thunkApi.rejectWithValue(e?.message ?? "Photo scan failed");
  }
});

/**
 * Redux slice for managing device photo discovery and navigation.
 */
export const mediaScanSlice = createSlice({
  name: "mediaScan",
  initialState,
  reducers: {
    /** Updates the permission status in state */
    setPermission(state, action: PayloadAction<MediaScanState["permission"]>) {
      state.permission = action.payload;
    },
    /** Sets the scan progress, clamped between 0.0 and 1.0 */
    setProgress(state, action: PayloadAction<number>) {
      state.progress = Math.max(0, Math.min(action.payload, 1));
    },
    /** Increments the cursor for card-based navigation, wrapping back to 0 */
    next(state) {
      const n = state.items.length;
      if (n === 0) return;
      state.cursor = (state.cursor + 1) % n;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(scanDevicePhotos.pending, (state) => {
        state.isScanning = true;
        state.progress = 0;
        state.error = undefined;
        state.items = [];
        state.cursor = 0;
      })
      .addCase(scanDevicePhotos.fulfilled, (state, action) => {
        state.isScanning = false;
        state.items = action.payload;
        state.cursor = 0;
        state.progress = 1;
      })
      .addCase(scanDevicePhotos.rejected, (state, action) => {
        state.isScanning = false;
        state.error = action.payload ?? "Scan failed";
      });
  },
});

export const mediaScanActions = mediaScanSlice.actions;
export default mediaScanSlice.reducer;