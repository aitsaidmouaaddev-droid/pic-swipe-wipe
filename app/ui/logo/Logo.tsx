import React, { useEffect, useRef } from "react";
import { Animated, ImageSourcePropType } from "react-native";
import { useTheme } from "@themes/ThemeContext";
import makeLogoStyles, {
    defaultLogoAnimation,
    LogoAnimationPreset,
} from "./logo.style";

/**
 * Props for the {@link Logo} component.
 */
export interface LogoProps {
    /**
     * Image source for the logo.
     * @example require("../../assets/logo.gif")
     */
    source: ImageSourcePropType;

    /**
     * Size (width and height) of the logo in pixels.
     * @defaultValue 200
     */
    size?: number;

    /**
     * Animation preset for the logo scale animation.
     * If omitted, {@link defaultLogoAnimation} is used.
     */
    animation?: LogoAnimationPreset;
}

/**
 * A themed, animated logo component.
 *
 * - Uses theme tokens from {@link useTheme}
 * - Runs a looping scale animation using React Native Animated
 */
export default function Logo({
    source,
    size = 200,
    animation = defaultLogoAnimation,
}: LogoProps) {
    const { theme } = useTheme();
    const styles = makeLogoStyles(theme, size);

    const scaleAnim = useRef(new Animated.Value(animation.scaleFrom)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: animation.scaleTo,
                    duration: animation.duration,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: animation.scaleFrom,
                    duration: animation.duration,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.Image
            source={source}
            style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
            resizeMode="contain"
        />
    );
}