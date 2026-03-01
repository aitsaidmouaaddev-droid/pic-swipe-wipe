/**
 * @file HomeScreen.tsx
 * @description Écran principal utilisant le MediaScreenLayout pour trier les nouveaux médias.
 */
import React, { useMemo, useState } from "react";
import { useAppSelector } from "@store/hooks";
import { AppMediaType } from "@store/mediaScanSlice";
import { useMedia } from "@hooks/useMedia.hook";
import { SelectOption } from "@ui/select/Select";
import { useTheme } from "@themes/ThemeContext";
import makeHomeScreenStyles from "./homeScreen.style";
import MediaScreenLayout from "@components/media-screen-layout/MediaScreenLayout";

export default function HomeScreen() {
  const { items, cursor } = useAppSelector((state) => state.mediaScan);
  const { theme } = useTheme();
  const { handleSwipeCommit } = useMedia();

  // On récupère l'objet global (UI + Actions)
  const styles = useMemo(() => makeHomeScreenStyles(theme), [theme]);

  const [activeFilter, setActiveFilter] = useState<string>("all");

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

  // 2. Configuration des actions utilisant les styles du thème
  const leftAction = {
    color: styles.actions.left.color,
    icon: { type: "vector", name: styles.actions.left.iconName } as const,
    onAction: async (item: any) => {
      await handleSwipeCommit(item.id, "left");
    },
  };

  const rightAction = {
    color: styles.actions.right.color,
    icon: { type: "vector", name: styles.actions.right.iconName } as const,
    onAction: async (item: any) => {
      await handleSwipeCommit(item.id, "right");
    },
  };

  return (
    <MediaScreenLayout
      items={items}
      cursor={cursor}
      leftAction={leftAction}
      rightAction={rightAction}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      filterOptions={filterOptions}
      emptyTitle="Plus de médias à trier. Lancez un scan !"
      tabBarHeight={60}
    />
  );
}
