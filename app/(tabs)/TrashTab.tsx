import React from "react";
import TrashScreen from "../screens/trash-screen/TrashScreen";
import FocusUnmount from "./FocusUnmount.wrapper";

/**
 * Route wrapper for the "Trash" tab.
 * * This component serves as the navigation entry point for the deleted/rejected media view,
 * delegating the rendering and state management to the {@link TrashScreen} component.
 * * @returns The rendered {@link TrashScreen} UI.
 */
export default function TrashTab() {
  return (
    <FocusUnmount>
      <TrashScreen />
    </FocusUnmount>
  );
}
