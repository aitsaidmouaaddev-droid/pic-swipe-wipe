import React from "react";
import ApprovedScreen from "../screens/approved-screen/ApprovedScreen";
import FocusUnmount from "./FocusUnmount.wrapper";

/**
 * Route wrapper for the "Approved" tab.
 * * This component acts as the navigation entry point for the route, delegating
 * the actual UI and business logic to the underlying {@link ApprovedScreen} component.
 * Keeping this wrapper separate ensures that the main screen logic remains decoupled
 * from the routing layer, making it easier to test or reuse.
 *
 * @returns The rendered {@link ApprovedScreen} UI.
 */
export default function ApprovedTab() {
  return (
    <FocusUnmount>
      <ApprovedScreen />
    </FocusUnmount>
  );
}
