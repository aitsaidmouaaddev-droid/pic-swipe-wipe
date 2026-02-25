import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

/**
 * Typed version of useDispatch (so dispatch knows your thunks and actions).
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed version of useSelector (so state is strongly typed).
 */
export const useAppSelector = useSelector.withTypes<RootState>();

export default {
  useAppDispatch,
  useAppSelector,
};
