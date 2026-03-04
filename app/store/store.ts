import { configureStore } from "@reduxjs/toolkit";
import mediaScanReducer from "./mediaScanSlice";

/**
 * Redux store configuration.
 * Add more reducers here as your app grows (trash/approved, settings, etc.).
 */
const store = configureStore({
  reducer: {
    mediaScan: mediaScanReducer,
  },
});

export default store;

/**
 * Types used across the app.
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
