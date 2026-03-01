import React, { useMemo, useState } from "react";
import { Pressable } from "react-native";
import { useAppSelector } from "@store/hooks";
import { AppMediaType } from "@store/mediaScanSlice";
import { useMedia } from "@hooks/useMedia.hook";
import MediaScreenLayout from "@components/media-screen-layout/MediaScreenLayout";
import Icon from "@ui/icon/Icon";
import { useTheme } from "@themes/ThemeContext";
import makeTrashScreenStyles from "./trashScreen.style";

export default function TrashScreen() {
  /* const { trashedItems, trashedCursor } = useAppSelector((state) => state.mediaScan);
  const { restoreFromTrash, emptyTrash } = useMedia(); // Tes fonctions métier */
  const [filter, setFilter] = useState("all");

  const { theme } = useTheme();
  // On récupère l'objet global (UI + Actions)
  const styles = useMemo(() => makeTrashScreenStyles(theme), [theme]);

  // Configuration Swipe DROIT : Restaurer (Couleur bleue ou orange)
  const rightAction = {
    color: styles.actions.right.color,
    icon: { type: "vector", name: styles.actions.right.iconName } as const,
    onAction: async (item: any) => {
      //await restoreFromTrash(item.id);
    },
  };

  return (
    <MediaScreenLayout
      items={[]}
      cursor={0}
      /* items={trashedItems}
      cursor={trashedCursor} */
      // Pas de leftAction = Swipe gauche bloqué
      rightAction={rightAction} // Swipe droit désactivé pour éviter les confusions (on restaure via le bouton dédié)
      activeFilter={filter}
      onFilterChange={setFilter}
      filterOptions={[]} // On pourra les ajouter plus tard
      emptyTitle="La corbeille est vide"
      // Slot spécifique : Bouton pour vider toute la corbeille
      renderHeaderExtra={() => (
        <Pressable /*  onPress={emptyTrash} */>
          <Icon type="vector" name="trash-outline" color="#ff3b30" size={24} />
        </Pressable>
      )}
    />
  );
}
