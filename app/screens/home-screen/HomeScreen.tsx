/**
 * @file HomeScreen.tsx
 * @description Écran principal connectant le deck de cartes à Redux et à la persistance SQLite.
 * Gère la navigation dans les médias et l'enregistrement des décisions de l'utilisateur.
 */
import React from "react";
import { View, Text, Image } from "react-native";
import CardsDeck from "@ui/cards-deck/CardsDeck";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { mediaScanActions } from "@store/mediaScanSlice";
import { selectFrontItem, selectBackItem } from "@store/mediaSelectors";
import { useMedia } from "@hooks/useMedia.hook";

export default function HomeScreen() {
  console.log(`HomeScreen rendered `);

  const dispatch = useAppDispatch();

  /** * 🧠 Récupération du hook global pour la persistance.
   * handleSwipeCommit s'occupe de l'écriture en base SQLite.
   */
  const { handleSwipeCommit } = useMedia();

  const frontItem = useAppSelector(selectFrontItem);
  const backItem = useAppSelector(selectBackItem);

  /**
   * Helper pour le rendu des médias.
   */
  const render = (item: any, label: string) => {
    if (item.type === "photo") {
      return <Image source={{ uri: item.uri }} style={{ flex: 1 }} resizeMode="cover" />;
    }
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{label} VIDEO</Text>
        <Text>{item.name}</Text>
      </View>
    );
  };

  /**
   * 🚀 Gestionnaire de swipe synchronisé.
   * Combine la mise à jour de l'UI (Redux) et la sauvegarde (SQLite).
   */
  const onCommit = (direction: "left" | "right") => {
    if (!frontItem) return;

    // 1. Sauvegarde la décision en base de données (Metadata Ledger)
    handleSwipeCommit(frontItem.id, direction);

    // 2. Passe à l'item suivant dans Redux pour l'animation UI
    dispatch(mediaScanActions.next());
  };

  if (!frontItem) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No items yet. Run scan.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CardsDeck
        key={frontItem.id}
        containerStyle={{ flex: 1 }}
        cardStyle={{ borderRadius: 0 }}
        frontItem={frontItem}
        backItem={backItem}
        overlayMaxOpacity={0.4}
        renderFront={(item) => render(item, "FRONT")}
        renderBack={(item) => render(item, "BACK")}
        leftAction={{
          color: "#34c759", // Green for 'Keep'
          icon: { type: "vector", name: "checkmark-circle" },
          widthRatio: 0.3,
        }}
        rightAction={{
          color: "#ff3b30", // Red for 'Delete'
          icon: { type: "vector", name: "trash" },
          widthRatio: 0.3,
        }}
        /**
         * 🎯 Appel de notre gestionnaire synchronisé.
         * On passe la direction reçue de CardsDeck au hook.
         */
        onSwipeCommit={onCommit}
      />
    </View>
  );
}
