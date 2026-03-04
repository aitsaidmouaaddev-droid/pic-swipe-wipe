import "dotenv/config"; // Charge le .env pour le build
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "pic-swipe-wipe",
  slug: "pic-swipe-wipe",
  version: "1.0.0",
  newArchEnabled: true,
  android: {
    ...config.android,
    package: "com.stifler9421sorganization.picswipewipe",
    edgeToEdgeEnabled: true,
  },
  plugins: [
    "expo-router",
    [
      "expo-media-library",
      {
        photosPermission: "Allow Pic Swipe Wipe to access your photos.",
        savePhotosPermission: "Allow Pic Swipe Wipe to save changes to your photos.",
      },
    ],
    "expo-sqlite",
    "@react-native-community/datetimepicker",
    "expo-video"
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    ...config.extra,
    eas: {
      projectId: "8f860b76-ab07-4c3c-8cbc-812ecff812cf",
    },
  },
});
