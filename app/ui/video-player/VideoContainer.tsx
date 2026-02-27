/**
 * @file VideoContainer.tsx
 * @description Lecteur vidéo haute performance utilisant expo-video.
 * Gère le cycle de vie du player natif, les feedbacks visuels animés,
 * et le scrubbing interactif.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useEventListener } from "expo";
import { createVideoPlayer, VideoView } from "expo-video";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
} from "react-native-reanimated";

import { useTheme } from "@themes/ThemeContext";
import Icon from "@ui/icon/Icon";
import { VideoProgressBar } from "./VideoProgressBar";
import { VideoGestures } from "./VideoGestures";
import Button from "@ui/button/Button";
import { makeVideoStyles } from "./videoPlayer.style";

/**
 * Offsets de positionnement pour les contrôles par rapport à la TabBar.
 */
const PROGRESS_BAR_OFFSET = 15;
const MUTE_BUTTON_OFFSET = 65;

export interface VideoContainerProps {
  /** URI de la source vidéo (locale ou distante) */
  uri: string;
  /** Définit si la vidéo doit être en lecture active */
  isActive: boolean;
  /** Hauteur de la TabBar pour décaler les contrôles du bas */
  tabBarHeight: number;
}

/**
 * Composant de lecture vidéo optimisé.
 * Utilise un `playerRef` manuel pour éviter les fuites de mémoire (Shared Object Released)
 * lors des cycles de réutilisation des composants dans une liste.
 */
export const VideoContainer = ({ uri, isActive, tabBarHeight }: VideoContainerProps) => {
  const { theme } = useTheme();
  const styles = makeVideoStyles(theme);

  // États de lecture et d'UI
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [lastAction, setLastAction] = useState<"play" | "pause">("play");

  // Valeurs animées pour le feedback central
  const feedbackOpacity = useSharedValue(0);
  const feedbackScale = useSharedValue(0.5);

  /**
   * Déclenche l'animation de l'icône centrale lors d'un Play/Pause.
   */
  const triggerFeedback = useCallback(
    (type: "play" | "pause") => {
      setLastAction(type);
      feedbackOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(400, withTiming(0, { duration: 200 })),
      );
      feedbackScale.value = withSequence(
        withTiming(1.2, { duration: 200 }),
        withDelay(400, withTiming(0.8, { duration: 200 })),
      );
    },
    [feedbackOpacity, feedbackScale],
  );

  /**
   * Initialisation manuelle du player.
   * On utilise createVideoPlayer pour un contrôle total sur le cycle de vie natif.
   */
  const playerRef = useRef<any>(null);
  if (!playerRef.current) {
    const p = createVideoPlayer(uri);
    p.loop = true;
    p.timeUpdateEventInterval = 0.2;
    playerRef.current = p;
  }
  const player = playerRef.current;

  // Gestion du changement de source (Recyclage de cellule)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await player.replaceAsync(uri);
        if (cancelled) return;
        setCurrentTime(0);
        isActive ? player.play() : player.pause();
      } catch (e) {
        /* Erreur ignorée lors du démontage */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uri, player]);

  // Synchronisation de l'état de lecture
  useEffect(() => {
    try {
      isActive ? player.play() : player.pause();
    } catch (e) {
      /* Ignore */
    }
  }, [isActive, player]);

  // Synchronisation du mute
  useEffect(() => {
    try {
      player.muted = isMuted;
    } catch (e) {
      /* Ignore */
    }
  }, [isMuted, player]);

  // Listeners d'événements natifs
  useEventListener(player, "sourceLoad", (event: any) => {
    if (event?.duration > 0) setDuration(event.duration);
  });

  useEventListener(player, "timeUpdate", (event: any) => {
    if (!isScrubbing && typeof event?.currentTime === "number") {
      setCurrentTime(event.currentTime);
    }
  });

  // Nettoyage final de la mémoire
  useEffect(() => {
    return () => {
      try {
        playerRef.current?.release?.();
      } catch (e) {
        /* Ignore */
      } finally {
        playerRef.current = null;
      }
    };
  }, []);

  /**
   * Alterne la lecture et déclenche le feedback visuel.
   */
  const togglePlay = useCallback(() => {
    try {
      if (player.playing) {
        player.pause();
        triggerFeedback("pause");
      } else {
        player.play();
        triggerFeedback("play");
      }
    } catch (e) {
      /* Ignore */
    }
  }, [player, triggerFeedback]);

  // Styles Reanimated
  const animatedFeedbackStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [{ scale: feedbackScale.value }],
  }));

  // Handlers pour la barre de progression (Scrubbing)
  const onScrubStart = useCallback(() => {
    setIsScrubbing(true);
    try {
      player.pause();
    } catch (e) {}
  }, [player]);

  const onScrub = useCallback(
    (r: number) => {
      const target = Math.max(0, Math.min(1, r)) * (duration || 1);
      setCurrentTime(target);
      try {
        player.currentTime = target;
      } catch (e) {}
    },
    [duration, player],
  );

  const onScrubEnd = useCallback(
    (r: number) => {
      const target = Math.max(0, Math.min(1, r)) * (duration || 1);
      setIsScrubbing(false);
      setCurrentTime(target);
      try {
        player.currentTime = target;
        if (isActive) player.play();
      } catch (e) {}
    },
    [duration, isActive, player],
  );

  return (
    <View style={styles.container} testID="video-container">
      <VideoView
        player={player}
        style={styles.videoView}
        contentFit="cover"
        nativeControls={false}
        surfaceType="textureView"
      />

      {/* Couche de Feedback Animée */}
      <View style={styles.feedbackContainer}>
        <Animated.View style={[styles.feedbackIcon, animatedFeedbackStyle]}>
          <Icon
            type="vector"
            name={lastAction === "play" ? "play" : "pause"}
            size={40}
            color="#FFF"
          />
        </Animated.View>
      </View>

      {/* Zone de détection des gestes */}
      <VideoGestures onTogglePlay={togglePlay} onSeek={(s) => player.seekBy(s)} />

      {/* Barre de progression interactive */}
      <VideoProgressBar
        progress={Math.min(1, Math.max(0, currentTime / (duration || 1)))}
        bottomOffset={tabBarHeight + PROGRESS_BAR_OFFSET}
        onScrubStart={onScrubStart}
        onScrub={onScrub}
        onScrubEnd={onScrubEnd}
      />

      {/* Bouton de contrôle du volume */}
      <View style={[styles.muteButtonContainer, { bottom: tabBarHeight + MUTE_BUTTON_OFFSET }]}>
        <Button
          testID="mute-button"
          variant="primary"
          size="sm"
          onPress={() => setIsMuted((v) => !v)}
          icon={{
            type: "vector",
            name: isMuted ? "volume-mute" : "volume-high",
            color: theme.colors.primary,
          }}
          style={styles.muteButton}
        />
      </View>
    </View>
  );
};
