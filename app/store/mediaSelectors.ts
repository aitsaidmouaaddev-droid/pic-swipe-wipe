import type { RootState } from "@store/store";

/**
 * Sélectionne la liste des médias du bac "unknown" (à trier).
 */
export default function selectItems(state: RootState) {
  // ✅ On accède via le bucket "unknown"
  return state.mediaScan.unknown.items;
}

/**
 * Sélectionne le curseur actuel du bac "unknown".
 */
export function selectCursor(state: RootState) {
  return state.mediaScan.unknown.cursor;
}

/**
 * Sélectionne l'item de devant (index cursor) du bac "unknown".
 */
export function selectFrontItem(state: RootState) {
  const bucket = state.mediaScan.unknown;
  const items = bucket.items;
  const n = items.length;

  if (n === 0) return undefined;
  return items[bucket.cursor];
}

/**
 * Sélectionne l'item de derrière (index cursor + 1) du bac "unknown".
 */
export function selectBackItem(state: RootState) {
  const bucket = state.mediaScan.unknown;
  const items = bucket.items;
  const n = items.length;

  if (n === 0) return undefined;
  return items[(bucket.cursor + 1) % n];
}
