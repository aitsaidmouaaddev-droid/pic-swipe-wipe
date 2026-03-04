/**
 * @file VideoProgressBar.tsx
 */
import React from "react";
import { View } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { VideoPlayerShape } from "./videoPlayer.style";

export interface ProgressBarProps {
  styles: VideoPlayerShape["progressBar"];
  progress: number; // Position actuelle (0 à 1)
  bottomOffset: number;
  onScrubStart: () => void; // Quand on commence à glisser
  onScrub: (ratio: number) => void; // Pendant le glissement
  onScrubEnd: (ratio: number) => void; // Quand on lâche
}

const VideoProgressBar = ({
  progress,
  bottomOffset,
  onScrubStart,
  onScrub,
  onScrubEnd,
  styles,
}: ProgressBarProps) => {
  const [width, setWidth] = React.useState(0);

  // Utilisation d'un Pan Gesture configuré pour être réactif
  const gesture = Gesture.Pan()
    .averageTouches(true)
    .onStart(() => {
      runOnJS(onScrubStart)();
    })
    .onUpdate((e) => {
      if (width > 0) {
        const newRatio = Math.min(Math.max(0, e.x / width), 1);
        runOnJS(onScrub)(newRatio);
      }
    })
    .onEnd((e) => {
      if (width > 0) {
        const finalRatio = Math.min(Math.max(0, e.x / width), 1);
        runOnJS(onScrubEnd)(finalRatio);
      }
    });

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.container, { bottom: bottomOffset }]}
      testID="video-progress-bar"
    >
      <GestureDetector gesture={gesture}>
        {/* Important : cette View doit couvrir toute la zone de contact */}
        <View style={styles.hitSlop}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
            <View style={[styles.knob, { left: `${progress * 100}%` }]} />
          </View>
        </View>
      </GestureDetector>
    </View>
  );
};

export default VideoProgressBar;
