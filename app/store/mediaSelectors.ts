import type { RootState } from "@store/store";

/**
 * Selects the media list.
 */
export default function selectItems(state: RootState) {
  return state.mediaScan.items;
}

/**
 * Selects current cursor.
 */
export function selectCursor(state: RootState) {
  return state.mediaScan.cursor;
}

/**
 * Selects current front item (or undefined if empty).
 */
export function selectFrontItem(state: RootState) {
  const items = state.mediaScan.items;
  const n = items.length;
  if (n === 0) return undefined;
  return items[state.mediaScan.cursor];
}

/**
 * Selects current back item (or undefined if empty).
 */
export function selectBackItem(state: RootState) {
  const items = state.mediaScan.items;
  const n = items.length;
  if (n === 0) return undefined;
  return items[(state.mediaScan.cursor + 1) % n];
}
