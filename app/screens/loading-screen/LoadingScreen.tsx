/**
 * @file LoadingScreen.tsx
 * @description Écran de chargement initialisant la base de données et le scan des médias.
 */
import { getDatabase } from "@/app/database/sqlite";
import { useAppDispatch, useAppSelector } from "@hooks/store.hook";
import { scanDevicePhotos } from "@store/mediaScanSlice";
import { useTheme } from "@themes/ThemeContext";
import Logo from "@ui/logo/Logo";
import ProgressBar from "@ui/progress-bar/ProgressBar";
import { router } from "expo-router";
import * as React from "react";
import { useEffect } from "react";
import { Text, View } from "react-native";
import makeLoadingScreenStyles from "./loadingScreen.style";

export interface LoadingScreenProps {
  loadingText?: string;
  logoSource: Parameters<typeof Logo>[0]["source"];
  logoSize?: number;
}

export default function LoadingScreen({
  loadingText,
  logoSource,
  logoSize = 220,
}: LoadingScreenProps) {
  const { theme } = useTheme();
  const styles = makeLoadingScreenStyles(theme);
  const dispatch = useAppDispatch();

  // 1. On extrait 'unknown' au lieu de 'items'
  const { permission, isScanning, unknown, error } = useAppSelector((s) => s.mediaScan);

  /**
   * Effet de démarrage unique (Boot Sequence)
   */
  useEffect(() => {
    const bootApp = async () => {
      try {
        // A. Initialisation de la DB
        await getDatabase();

        // B. Petit délai pour la stabilité du bridge natif
        await new Promise((resolve) => setTimeout(resolve, 200));

        // C. Déclenchement du scan
        // Le résultat est maintenant un objet { unknown, trash, keep }
        const result = await dispatch(scanDevicePhotos()).unwrap();

        // D. Navigation si des nouveaux médias sont trouvés
        if (result.unknown.length > 0) {
          router.replace("/(tabs)/HomeTab");
        }
      } catch (e) {
        console.error("Boot Error", e);
      }
    };

    bootApp();
  }, [dispatch]);

  /**
   * Sécurité de navigation : redirection si le scan finit
   * et qu'on a des items dans le bac 'unknown'
   */
  useEffect(() => {
    if (!isScanning && unknown.items.length > 0) {
      router.replace("/(tabs)/HomeTab");
    }
  }, [isScanning, unknown.items.length]);

  /**
   * Message de statut dynamique
   */
  const subtitle =
    permission === "granted"
      ? isScanning
        ? "Recherche de nouveaux médias…"
        : "Scan terminé."
      : permission === "denied"
        ? "Accès à la galerie refusé."
        : "Vérification des permissions…";

  return (
    <View style={styles.container}>
      <Logo source={logoSource} size={logoSize} />

      {loadingText ? <Text style={styles.title}>{loadingText}</Text> : null}
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.bottom}>
        <ProgressBar variant="circular" isInfinite size={64} strokeWidth={6} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
