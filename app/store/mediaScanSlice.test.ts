import { configureStore } from "@reduxjs/toolkit";
import reducer, { mediaScanActions, scanDevicePhotos, type MediaScanState } from "./mediaScanSlice";

import * as MediaLibrary from "expo-media-library";
import mediaService, { AppMediaType, AppPermissionStatus } from "@services/mediaService";
import { MediaVerdict } from "../database/sqlite";

// Mock du nouveau service fusionné
jest.mock("@services/mediaService", () => ({
  __esModule: true,
  default: {
    performFullScan: jest.fn(),
    recordDecision: jest.fn(),
  },
  AppPermissionStatus: {
    UNKNOWN: "unknown",
    GRANTED: "granted",
    DENIED: "denied",
  },
  AppMediaType: {
    PHOTO: "photo",
    VIDEO: "video",
  },
}));

const mockRequestPermissionsAsync = MediaLibrary.requestPermissionsAsync as jest.Mock;
const mockPerformFullScan = mediaService.performFullScan as jest.Mock;

// --------------------
// Helpers
// --------------------
function makeStore(preloadedState?: Partial<MediaScanState>) {
  return configureStore({
    reducer: { mediaScan: reducer },
    // On enveloppe le preloadedState dans la clé du slice
    preloadedState: preloadedState ? { mediaScan: preloadedState as MediaScanState } : undefined,
  });
}

describe("mediaScanSlice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reducers", () => {
    it("next increments cursor in the specific bucket", () => {
      const store = makeStore({
        unknown: {
          items: [
            {
              id: "1",
              name: "a",
              type: AppMediaType.PHOTO,
              uri: "u1",
              verdict: MediaVerdict.UNKNOWN,
            },
            {
              id: "2",
              name: "b",
              type: AppMediaType.PHOTO,
              uri: "u2",
              verdict: MediaVerdict.UNKNOWN,
            },
          ],
          cursor: 0,
        },
      } as any);

      store.dispatch(mediaScanActions.next("unknown"));
      expect(store.getState().mediaScan.unknown.cursor).toBe(1);

      store.dispatch(mediaScanActions.next("unknown"));
      expect(store.getState().mediaScan.unknown.cursor).toBe(0); // Wrap around
    });

    it("removePermanently filters items and adjusts cursor", () => {
      const store = makeStore({
        trash: {
          items: [
            { id: "1", name: "a", type: AppMediaType.PHOTO, uri: "u", verdict: MediaVerdict.TRASH },
            { id: "2", name: "b", type: AppMediaType.PHOTO, uri: "u", verdict: MediaVerdict.TRASH },
          ],
          cursor: 1,
        },
      } as any);

      store.dispatch(mediaScanActions.removePermanently("2"));

      const state = store.getState().mediaScan.trash;
      expect(state.items).toHaveLength(1);
      expect(state.cursor).toBe(0); // Le curseur s'ajuste
    });
  });

  describe("scanDevicePhotos thunk", () => {
    it("fulfilled populates unknown, trash and keep buckets via service", async () => {
      mockRequestPermissionsAsync.mockResolvedValue({ status: "granted" });

      const mockResult = {
        unknown: [
          { id: "1", name: "a", type: AppMediaType.PHOTO, uri: "u", verdict: MediaVerdict.UNKNOWN },
        ],
        trash: [
          { id: "2", name: "b", type: AppMediaType.PHOTO, uri: "u", verdict: MediaVerdict.TRASH },
        ],
        keep: [],
      };

      mockPerformFullScan.mockResolvedValue(mockResult);

      const store = makeStore();
      await store.dispatch(scanDevicePhotos());

      const state = store.getState().mediaScan;
      expect(state.unknown.items).toHaveLength(1);
      expect(state.trash.items).toHaveLength(1);
      expect(state.isScanning).toBe(false);
      expect(state.progress).toBe(1);
    });

    it("sets permission DENIED when OS refuses", async () => {
      mockRequestPermissionsAsync.mockResolvedValue({ status: "denied" });

      const store = makeStore();
      await store.dispatch(scanDevicePhotos());

      expect(store.getState().mediaScan.permission).toBe(AppPermissionStatus.DENIED);
      expect(mockPerformFullScan).not.toHaveBeenCalled();
    });
  });
});
