import HomeScreen from "../screens/home-screen/HomeScreen";
import FocusUnmount from "./FocusUnmount.wrapper";

/**
 * Route wrapper for the "Home" tab.
 * * This component acts as the navigation entry point for the main swiping interface,
 * delegating the actual UI and interaction logic to the underlying {@link HomeScreen} component.
 * * @returns The rendered {@link HomeScreen} UI.
 */
export default function HomeTab() {
  return (
    <FocusUnmount>
      <HomeScreen />
    </FocusUnmount>
  );
}
