/**
 * @file ApprovedScreen.tsx
 * @description Manages media marked as "Keep".
 * Mirror of TrashScreen UI: Swipe LEFT restores to Inbox, Filter at top right.
 */
import { MediaVerdict } from "@/app/database/sqlite";
import MediaScreenLayout from "@components/media-screen-layout/MediaScreenLayout";
import APP_CONFIG from "@config";
import { useAppSelector } from "@hooks/store.hook";
import { useTheme } from "@themes/ThemeContext";
import Select, { SelectOption } from "@ui/select/Select";
import React, { useMemo, useState } from "react";
import { View } from "react-native";
import makeApprovedScreenStyles from "./approvedScreen.style";
import { AppMediaType } from "@services/mediaService";
import useMedia from "@hooks/media.hook";

export default function ApprovedScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => makeApprovedScreenStyles(theme), [theme]);

  // 1. Redux & Media logic: Access the 'keep' bucket
  const { keep } = useAppSelector((state) => state.mediaScan);
  const { items, cursor } = keep;
  const { restore } = useMedia();

  const [activeFilter, setActiveFilter] = useState<string>("all");

  // 2. Local filtering logic
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

  const filterOptions: SelectOption[] = [
    {
      label: "All Approved",
      value: "all",
      startIcon: { type: "vector", name: "heart-outline" },
    },
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

  // Configuration Swipe LEFT: Restore to Inbox
  const leftAction = {
    color: APP_CONFIG.decisions.restore.color,
    icon: {
      type: "vector",
      name: APP_CONFIG.decisions.restore.icon,
    } as const,
    onAction: async (item: any) => {
      // Moves item from 'keep' back to 'unknown'
      await restore(item.id, MediaVerdict.KEEP);
    },
  };

  return (
    <MediaScreenLayout
      items={filteredItems}
      cursor={displayCursor}
      // 🔄 Swipe LEFT to undo approval (Restore)
      leftAction={leftAction}
      // 🔒 Swipe RIGHT blocked (already kept)
      rightAction={undefined}
      emptyTitle="No approved media yet"
    >
      {/* 🎨 UI OVERLAY: Mirror of TrashScreen logic */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {/* FILTER AT TOP RIGHT */}
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

        {/* Note: Permanent delete button is omitted here as requested */}
      </View>
    </MediaScreenLayout>
  );
}
