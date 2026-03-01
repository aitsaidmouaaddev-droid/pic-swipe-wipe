/**
 * @file mediaScanSlice.test.ts
 * @description
 * Tests unitaires du slice mediaScanSlice (Redux Toolkit).
 *
 * Ce fichier teste :
 * - Les reducers synchrones (setPermission, setProgress, next)
 * - Le thunk scanDevicePhotos : pending/fulfilled/rejected
 * - Les intégrations avec MediaLibrary + SQLite (mockées)
 *
 * Principes de test :
 * - On mock expo-media-library pour contrôler permissions + assets
 * - On mock mediaPersistenceService pour contrôler le ledger SQLite (Map id -> verdict)
 * - On utilise un store RTK réel pour tester le flux des thunks
 */

import { configureStore } from "@reduxjs/toolkit";
import reducer, {
  mediaScanActions,
  scanDevicePhotos,
  AppPermissionStatus,
  AppMediaType,
  type MediaScanState,
} from "./mediaScanSlice";

import * as MediaLibrary from "expo-media-library";
import { mediaPersistenceService } from "../services/mediaPersistenceService";

// --------------------
// Mocks
// --------------------
jest.mock("expo-media-library", () => {
  return {
    requestPermissionsAsync: jest.fn(),
    getAssetsAsync: jest.fn(),
    MediaType: { photo: "photo", video: "video" },
    SortBy: { creationTime: "creationTime" },
  };
});

jest.mock("../services/mediaPersistenceService", () => ({
  mediaPersistenceService: {
    getCategorizedIds: jest.fn(),
  },
}));

const mockRequestPermissionsAsync = MediaLibrary.requestPermissionsAsync as jest.Mock;
const mockGetAssetsAsync = MediaLibrary.getAssetsAsync as jest.Mock;
const mockGetCategorizedIds = mediaPersistenceService.getCategorizedIds as jest.Mock;

// --------------------
// Helpers
// --------------------
function makeStore(preloadedState?: Partial<{ mediaScan: MediaScanState }>) {
  return configureStore({
    reducer: { mediaScan: reducer },
    preloadedState: preloadedState as any,
  });
}

function asset(partial: Partial<any>) {
  return {
    id: "id",
    filename: "file.jpg",
    uri: "file://uri",
    mediaType: MediaLibrary.MediaType.photo,
    duration: 0,
    ...partial,
  };
}

describe("mediaScanSlice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reducers", () => {
    it("setPermission sets permission", () => {
      const store = makeStore();
      store.dispatch(mediaScanActions.setPermission(AppPermissionStatus.GRANTED));
      expect(store.getState().mediaScan.permission).toBe(AppPermissionStatus.GRANTED);
    });

    it("setProgress clamps between 0 and 1", () => {
      const store = makeStore();

      store.dispatch(mediaScanActions.setProgress(0.5));
      expect(store.getState().mediaScan.progress).toBe(0.5);

      store.dispatch(mediaScanActions.setProgress(10));
      expect(store.getState().mediaScan.progress).toBe(1);

      store.dispatch(mediaScanActions.setProgress(-2));
      expect(store.getState().mediaScan.progress).toBe(0);
    });

    it("next does nothing when items is empty", () => {
      const store = makeStore();
      store.dispatch(mediaScanActions.next());
      expect(store.getState().mediaScan.cursor).toBe(0);
    });

    it("next increments cursor and wraps around", () => {
      const store = makeStore({
        mediaScan: {
          permission: AppPermissionStatus.UNKNOWN,
          isScanning: false,
          progress: 0,
          cursor: 0,
          items: [
            { id: "a", name: "a", type: AppMediaType.PHOTO, uri: "a" },
            { id: "b", name: "b", type: AppMediaType.PHOTO, uri: "b" },
            { id: "c", name: "c", type: AppMediaType.VIDEO, uri: "c", duration: 12 },
          ],
          error: undefined,
        },
      });

      store.dispatch(mediaScanActions.next());
      expect(store.getState().mediaScan.cursor).toBe(1);

      store.dispatch(mediaScanActions.next());
      expect(store.getState().mediaScan.cursor).toBe(2);

      store.dispatch(mediaScanActions.next());
      expect(store.getState().mediaScan.cursor).toBe(0);
    });
  });

  describe("scanDevicePhotos thunk", () => {
    it("pending resets state for scan", async () => {
      // Arrange: permission granted, but we will never reach fulfilled because we stop after dispatching
      mockRequestPermissionsAsync.mockResolvedValue({ status: "granted" });
      mockGetCategorizedIds.mockResolvedValue(new Map());
      mockGetAssetsAsync.mockResolvedValue({ assets: [] });

      const store = makeStore({
        mediaScan: {
          permission: AppPermissionStatus.GRANTED,
          isScanning: false,
          progress: 1,
          items: [{ id: "x", name: "x", type: AppMediaType.PHOTO, uri: "x" }],
          cursor: 2,
          error: "old",
        } as any,
      });

      const p = store.dispatch(scanDevicePhotos());

      // Immediately after dispatch, pending should have run
      const state = store.getState().mediaScan;
      expect(state.isScanning).toBe(true);
      expect(state.items).toEqual([]);
      expect(state.cursor).toBe(0);
      expect(state.error).toBeUndefined();
      expect(state.progress).toBe(0);

      await p;
    });

    it("rejects when permission denied and sets permission DENIED", async () => {
      mockRequestPermissionsAsync.mockResolvedValue({ status: "denied" });

      const store = makeStore();

      const result = await store.dispatch(scanDevicePhotos());

      // thunk result
      expect(scanDevicePhotos.rejected.match(result)).toBe(true);
      expect((result as any).payload).toBe("Permission d'accès aux médias refusée.");

      // state updated
      const state = store.getState().mediaScan;
      expect(state.permission).toBe(AppPermissionStatus.DENIED);
      expect(state.isScanning).toBe(false);
      expect(state.error).toBe("Permission d'accès aux médias refusée.");
      expect(mockGetCategorizedIds).not.toHaveBeenCalled();
      expect(mockGetAssetsAsync).not.toHaveBeenCalled();
    });

    it("fulfilled: filters already categorized assets (Map.has) and maps to MediaItem", async () => {
      mockRequestPermissionsAsync.mockResolvedValue({ status: "granted" });

      // Ledger SQLite: "2" already categorized -> should be excluded
      mockGetCategorizedIds.mockResolvedValue(new Map([["2", "liked"]]));

      mockGetAssetsAsync.mockResolvedValue({
        assets: [
          asset({
            id: "1",
            filename: "a.jpg",
            mediaType: MediaLibrary.MediaType.photo,
            duration: 0,
          }),
          asset({
            id: "2",
            filename: "b.jpg",
            mediaType: MediaLibrary.MediaType.photo,
            duration: 0,
          }),
          asset({
            id: "3",
            filename: "c.mp4",
            mediaType: MediaLibrary.MediaType.video,
            duration: 42,
          }),
          asset({
            id: "4",
            filename: undefined,
            mediaType: MediaLibrary.MediaType.video,
            duration: 0,
          }),
        ],
        endCursor: "x",
        hasNextPage: false,
      });

      const store = makeStore();

      const result = await store.dispatch(scanDevicePhotos());

      expect(scanDevicePhotos.fulfilled.match(result)).toBe(true);

      // Ensure it called external services
      expect(mockGetCategorizedIds).toHaveBeenCalledTimes(1);
      expect(mockGetAssetsAsync).toHaveBeenCalledTimes(1);

      // Ensures correct call args: limit + types + sort
      expect(mockGetAssetsAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          first: 500,
          mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
          sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        }),
      );

      // State assertions
      const state = store.getState().mediaScan;

      expect(state.permission).toBe(AppPermissionStatus.GRANTED);
      expect(state.isScanning).toBe(false);
      expect(state.progress).toBe(1);
      expect(state.error).toBeUndefined();

      // "2" filtered out => 3 items remain (1,3,4)
      expect(state.items).toHaveLength(3);

      expect(state.items[0]).toEqual({
        id: "1",
        name: "a.jpg",
        type: AppMediaType.PHOTO,
        uri: "file://uri",
        duration: undefined,
      });

      expect(state.items[1]).toEqual({
        id: "3",
        name: "c.mp4",
        type: AppMediaType.VIDEO,
        uri: "file://uri",
        duration: 42,
      });

      // filename undefined => fallback to id
      expect(state.items[2]).toEqual({
        id: "4",
        name: "4",
        type: AppMediaType.VIDEO,
        uri: "file://uri",
        duration: undefined,
      });
    });

    it("rejects on unexpected error and sets error in state", async () => {
      mockRequestPermissionsAsync.mockResolvedValue({ status: "granted" });
      mockGetCategorizedIds.mockResolvedValue(new Map());
      mockGetAssetsAsync.mockRejectedValue(new Error("boom"));

      const store = makeStore();

      const result = await store.dispatch(scanDevicePhotos());

      expect(scanDevicePhotos.rejected.match(result)).toBe(true);
      expect((result as any).payload).toBe("boom");

      const state = store.getState().mediaScan;
      expect(state.permission).toBe(AppPermissionStatus.GRANTED);
      expect(state.isScanning).toBe(false);
      expect(state.error).toBe("boom");
    });

    it("treats getCategorizedIds returning undefined as empty Map", async () => {
      mockRequestPermissionsAsync.mockResolvedValue({ status: "granted" });

      // simulate undefined return
      mockGetCategorizedIds.mockResolvedValue(undefined);

      mockGetAssetsAsync.mockResolvedValue({
        assets: [asset({ id: "1", filename: "a.jpg", mediaType: MediaLibrary.MediaType.photo })],
      });

      const store = makeStore();

      const result = await store.dispatch(scanDevicePhotos());

      expect(scanDevicePhotos.fulfilled.match(result)).toBe(true);
      expect(store.getState().mediaScan.items).toHaveLength(1);
      expect(store.getState().mediaScan.items[0].id).toBe("1");
    });
  });
});
