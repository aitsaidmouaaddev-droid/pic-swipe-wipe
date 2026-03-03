/**
 * @file FocusUnmount.tsx
 * @description Wrapper pour démonter automatiquement les composants lourds (vidéo, caméra)
 * lorsque l'onglet perd le focus.
 */
import React from "react";
import { useIsFocused } from "@react-navigation/native";

interface FocusUnmountProps {
  children: React.ReactNode;
  /** Optionnel : on peut afficher un placeholder (ex: écran noir) au lieu de null */
  fallback?: React.ReactNode;
}

const FocusUnmount = ({ children, fallback = null }: FocusUnmountProps) => {
  const isFocused = useIsFocused();

  // Si l'écran est focus, on rend les enfants.
  // Sinon, on démonte tout (ce qui coupe les players vidéos proprement).
  return <>{isFocused ? children : fallback}</>;
};

export default FocusUnmount;
