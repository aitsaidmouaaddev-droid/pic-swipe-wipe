/**
 * @file TrashScreen.tsx
 * @description Manages media sent to the trash.
 * Swipe Right to restore. Permanent delete button in the header.
 */
import { MediaVerdict } from "@/app/database/sqlite";
import MediaScreenLayout from "@components/media-screen-layout/MediaScreenLayout";
import APP_CONFIG from "@config";
import useMedia from "@hooks/media.hook";
import { useAppSelector } from "@hooks/store.hook";
import { AppMediaType } from "@services/mediaService";
import { useTheme } from "@themes/ThemeContext";
import Button from "@ui/button/Button";
import Select, { SelectOption } from "@ui/select/Select";
import React, { useMemo, useState } from "react";
import { View } from "react-native";
import makeTrashScreenStyles from "./trashScreen.style";

export default function TrashScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => makeTrashScreenStyles(theme), [theme]);

  // 1. Redux & Media logic
  const { trash } = useAppSelector((state) => state.mediaScan);
  const { items, cursor } = trash;
  const { restore, deletePermanently } = useMedia();

  const [activeFilter, setActiveFilter] = useState<string>("all");

  // 2. Local filtering logic
  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter((item) => item.type === activeFilter);
  }, [items, activeFilter]);

  // 3. Cursor sync
  const displayCursor = useMemo(() => {
    if (activeFilter === "all") return cursor;
    const currentItem = items[cursor];
    if (!currentItem) return 0;
    const idx = filteredItems.findIndex((i) => i.id === currentItem.id);
    return idx !== -1 ? idx : 0;
  }, [filteredItems, items, cursor, activeFilter]);

  const filterOptions: SelectOption[] = [
    {
      label: "All Trash",
      value: "all",
      startIcon: { type: "vector", name: "folder-open-outline" },
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

  // Configuration Swipe RIGHT: Restore
  const rightAction = {
    color: APP_CONFIG.decisions.restore.color,
    icon: { type: "vector", name: APP_CONFIG.decisions.restore.icon } as const,
    onAction: async (item: any) => {
      await restore(item.id, MediaVerdict.TRASH);
    },
  };

  return (
    <MediaScreenLayout
      items={filteredItems}
      cursor={displayCursor}
      leftAction={undefined}
      rightAction={rightAction}
      emptyTitle="Trash is empty"
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

        {/* 2. TRASH BUTTON AT MUTE LEVEL */}
        {filteredItems.length > 0 && (
          <View style={styles.wipeButtonContainer}>
            <Button
              variant="primary"
              size="sm"
              onPress={() => deletePermanently(filteredItems[displayCursor].id)}
              icon={{
                type: "vector",
                name: "trash-outline",
                color: theme.colors.danger,
              }}
              stylesOverride={{
                base: styles.deleteButton,
                content: styles.deleteButtonContent,
              }}
            />
          </View>
        )}
      </View>
    </MediaScreenLayout>
  );
}
