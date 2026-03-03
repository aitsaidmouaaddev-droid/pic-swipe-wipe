/**
 * @file VideoGestures.tsx
 * @description Gère les interactions tactiles : Play/Pause (simple tap) et Seek (double tap).
 */
import React, { useRef } from "react";
import { TouchableWithoutFeedback, View, Dimensions } from "react-native";
import { VideoPlayerShape } from "./videoPlayer.style";

interface GestureProps {
  /** Alterne entre lecture et pause */
  onTogglePlay: () => void;
  /** Avance ou recule dans la vidéo (en secondes) */
  onSeek: (offsetSeconds: number) => void;

  styles: VideoPlayerShape["gestures"];
}

const VideoGestures = ({ onTogglePlay, onSeek, styles }: GestureProps) => {
  const { width } = Dimensions.get("window");

  // 🎯 Correction du type : On utilise ReturnType pour s'adapter à l'environnement
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap = useRef<number>(0);

  /**
   * Analyse la pression pour différencier le simple du double tap.
   * - Simple Tap : Pause / Play après un délai de 250ms.
   * - Double Tap : Annule la pause et effectue un Seek +/- 3s.
   */
  const handlePress = (event: any) => {
    const now = Date.now();
    const x = event.nativeEvent.locationX;
    const DOUBLE_TAP_DELAY = 250;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // ⏩ DOUBLE TAP détecté
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      onSeek(x < width / 2 ? -3 : 3);
    } else {
      // ⏯️ SIMPLE TAP (en attente)
      // On stocke le timeout pour pouvoir l'annuler si un 2ème tap arrive
      timer.current = setTimeout(() => {
        onTogglePlay();
        timer.current = null;
      }, DOUBLE_TAP_DELAY);
    }
    lastTap.current = now;
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container} testID="video-gestures" />
    </TouchableWithoutFeedback>
  );
};

export default VideoGestures;
