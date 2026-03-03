/**
 * @file ApprovedScreen.tsx
 * @description Manages media marked as "Keep".
 * Mirror of TrashScreen: Swipe LEFT is active (to Trash), Swipe RIGHT is blocked.
 */
import { MediaVerdict } from "@/app/database/sqlite";
import MediaScreenLayout from "@components/media-screen-layout/MediaScreenLayout";
import APP_CONFIG from "@config";
import useMedia from "@hooks/media.hook";
import { useAppSelector } from "@hooks/store.hook";
import { AppMediaType } from "@store/mediaScanSlice";
import { useTheme } from "@themes/ThemeContext";
import { SelectOption } from "@ui/select/Select";
import React, { useMemo, useState } from "react";
import makeApprovedScreenStyles from "./approvedScreen.style";

export default function ApprovedScreen() {
  const { theme } = useTheme();

  // 1. Access the 'keep' bucket
  const { keep } = useAppSelector((state) => state.mediaScan);
  const { items, cursor } = keep;

  const styles = useMemo(() => makeApprovedScreenStyles(theme), [theme]);

  const { restore } = useMedia();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // 2. Local filtering
  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter((item) => item.type === activeFilter);
  }, [items, activeFilter]);

  // 3. Sync cursor for filtered view
  const displayCursor = useMemo(() => {
    if (activeFilter === "all") return cursor;
    const currentItem = items[cursor];
    if (!currentItem) return 0;
    const idx = filteredItems.findIndex((i) => i.id === currentItem.id);
    return idx !== -1 ? idx : 0;
  }, [filteredItems, items, cursor, activeFilter]);

  // 4. English Labels for i18n readiness
  const filterOptions: SelectOption[] = [
    { label: "All Approved", value: "all", startIcon: { type: "vector", name: "heart-outline" } },
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

  // Configuration Swipe GAUCHE : Envoyer à la corbeille (Action destructive)
  const leftAction = {
    color: APP_CONFIG.decisions.restore.color || styles.actions.right.color, // Souvent Orange ou Bleu
    icon: {
      type: "vector",
      name: APP_CONFIG.decisions.restore.icon || styles.actions.right.iconName,
    } as const,
    onAction: async (item: any) => {
      await restore(item.id, MediaVerdict.KEEP);
    },
  };

  return (
    <MediaScreenLayout
      items={filteredItems}
      cursor={displayCursor}
      // 🔄 INVERSION : Swipe GAUCHE activé pour supprimer
      leftAction={leftAction}
      // 🔒 Swipe DROIT indéfini pour bloquer (déjà approuvé)
      rightAction={undefined}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      filterOptions={filterOptions}
      emptyTitle="No approved media yet"
    />
  );
}
