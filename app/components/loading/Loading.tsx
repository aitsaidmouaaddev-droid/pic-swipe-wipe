import React from "react";
import LoadingScreen from "../../screens/loading-screen/LoadingScreen";

const LOGO_SOURCE = require("../../../assets/logo.png");
const LOADING_TEXT = "Scanning media…";

/**
 * Initial boot and redirection screen.
 * * This component acts as the primary entry point (index) for the application.
 * It renders the {@link LoadingScreen} while handling critical startup tasks,
 * specifically requesting device permissions and performing the initial media scan
 * before redirecting the user into the main application logic.
 * * @returns A {@link LoadingScreen} configured with the default logo and scanning text.
 */
export default function Loading() {
  return <LoadingScreen loadingText={LOADING_TEXT} logoSource={LOGO_SOURCE} />;
}
