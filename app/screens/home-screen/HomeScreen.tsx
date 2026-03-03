/**
 * @file HomeScreen.tsx
 * @description Écran principal utilisant le MediaScreenLayout pour trier les nouveaux médias (Unknown).
 */
import MediaScreenLayout from "@components/media-screen-layout/MediaScreenLayout";
import APP_CONFIG from "@config";
import useMedia from "@hooks/media.hook";
import { useAppSelector } from "@hooks/store.hook";
import { AppMediaType } from "@services/mediaService";
import { useTheme } from "@themes/ThemeContext";
import Select, { SelectOption } from "@ui/select/Select";
import React, { useMemo, useState } from "react";
import { View } from "react-native";
import makeHomeScreenStyles from "./homeScreen.style";

export default function HomeScreen() {
  // 1. Accès au bac "unknown" (médias non triés)
  const { unknown } = useAppSelector((state) => state.mediaScan);
  const { items, cursor } = unknown;

  const { theme } = useTheme();
  const { handleSwipeCommit } = useMedia();
  const styles = useMemo(() => makeHomeScreenStyles(theme), [theme]);

  const [activeFilter, setActiveFilter] = useState<string>("all");

  // 2. Logique de filtrage locale pour le Deck
  // On filtre la liste 'unknown' selon le choix de l'utilisateur (All / Photo / Video)
  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter((item) => item.type === activeFilter);
  }, [items, activeFilter]);

  /**
   * 3. Gestion de la "complexité cursor" avec filtre :
   * Le cursor de Redux pointe sur la liste complète (unknown.items).
   * Si on filtre, on doit trouver l'index de l'item courant dans la liste filtrée.
   * Si l'item courant ne correspond pas au filtre, on affiche le premier disponible.
   */
  const displayCursor = useMemo(() => {
    if (activeFilter === "all") return cursor;

    const currentItem = items[cursor];
    if (!currentItem) return 0;

    const indexInFiltered = filteredItems.findIndex((i) => i.id === currentItem.id);

    // Si l'item actuel est masqué par le filtre, on repart de l'index 0 de la liste filtrée
    return indexInFiltered !== -1 ? indexInFiltered : 0;
  }, [filteredItems, items, cursor, activeFilter]);

  const filterOptions: SelectOption[] = [
    { label: "All Media", value: "all", startIcon: { type: "vector", name: "layers-outline" } },
    {
      label: "Photos",
      value: AppMediaType.PHOTO,
      startIcon: { type: "vector", name: "image-outline" },
    },
    {
      label: "Videos",
      value: AppMediaType.VIDEO,
      startIcon: { type: "vector", name: "videocam-outline" },
    },
  ];

  const leftAction = {
    color: APP_CONFIG.decisions.trash.color || styles.actions.left.color, // Souvent Orange ou Bleu
    icon: {
      type: "vector",
      name: APP_CONFIG.decisions.trash.icon || styles.actions.left.iconName,
    } as const,
    onAction: async (item: any) => {
      // Appel au hook qui gère SQLite + Redux moveItem
      await handleSwipeCommit(item.id, "left");
    },
  };

  const rightAction = {
    color: APP_CONFIG.decisions.keep.color || styles.actions.right.color, // Souvent Orange ou Bleu
    icon: {
      type: "vector",
      name: APP_CONFIG.decisions.keep.icon || styles.actions.right.iconName,
    } as const,
    onAction: async (item: any) => {
      await handleSwipeCommit(item.id, "right");
    },
  };

  return (
    <MediaScreenLayout
      items={filteredItems} // On passe la liste filtrée
      cursor={displayCursor} // On passe l'index adapté à la liste filtrée
      leftAction={leftAction}
      rightAction={rightAction}
      emptyTitle="Plus de médias à trier. Lancez un scan !"
    >
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {/* 1. FILTER AT TOP RIGHT */}
        <View style={styles.filterContainer}>
          <Select
            options={filterOptions}
            value={activeFilter}
            onSelect={setActiveFilter}
            triggerIcon={{ type: "vector", name: "filter-outline" }}
            iconsOnly
            stylesOverride={{ trigger: styles.filterStyles }}
          />
        </View>
      </View>
    </MediaScreenLayout>
  );
}
