import React, { useMemo, useState } from "react";
import MediaScreenLayout from "@components/media-screen-layout/MediaScreenLayout";
import makeApprovedScreenStyles from "./approvedScreen.style";
import { useTheme } from "@themes/ThemeContext";

export default function ApprovedScreen() {
  /*   const { approvedItems, approvedCursor } = useAppSelector((state) => state.mediaScan);
    const { unapproveItem } = useMedia(); */
  const [filter, setFilter] = useState("all");
  const { theme } = useTheme();
  // On récupère l'objet global (UI + Actions)
  const styles = useMemo(() => makeApprovedScreenStyles(theme), [theme]);

  // Swipe GAUCHE : Remettre en attente (Undo)
  const leftAction = {
    color: styles.actions.right.color,
    icon: { type: "vector", name: styles.actions.right.iconName } as const,
    onAction: async (item: any) => {
      //await unapproveItem(item.id);
    },
  };

  return (
    <MediaScreenLayout
      items={[]}
      cursor={0}
      /*      items={approvedItems}
           cursor={approvedCursor} */
      leftAction={leftAction}
      // On peut laisser le rightAction vide ou mettre une icône "Star" inerte
      activeFilter={filter}
      onFilterChange={setFilter}
      filterOptions={[]}
      emptyTitle="Aucun média approuvé pour le moment"
    />
  );
}
