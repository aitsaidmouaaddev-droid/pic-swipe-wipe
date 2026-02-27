import { Redirect } from "expo-router";
/* import { LogBox } from "react-native";

LogBox.ignoreLogs([
  "Cannot set prop 'player' on view 'class expo.modules.video.SurfaceVideoView'",
  "Cannot use shared object that was already released",
]); */

/**
 * Absolute root entry point for the application routing.
 *
 * This component ensures that whenever the app is launched or the base URL (`/`)
 * is accessed, the user is immediately routed to the initialization flow.
 * It bypasses any default screens and performs a hard redirect to the
 * {@link !Loading | Loading component}, where critical tasks like device permissions
 * and media scanning take place before entering the main swiping interface.
 *
 * @returns An Expo Router `<Redirect>` component pointing to the loading route.
 */
export default function Index() {
  return <Redirect href="/components/loading/Loading" />;
}
