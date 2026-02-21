import { Redirect } from "expo-router";

/**
 * Root entry.
 *
 * Always start with loading screen.
 */
export default function Index() {
  return <Redirect href="/components/loading/Loading" />;
}