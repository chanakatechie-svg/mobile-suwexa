import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

import type { AppDispatch, RootState } from "./index";

/** Typed dispatch — avoids repeating useDispatch<AppDispatch>() at every call site. */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** Typed selector — no explicit RootState annotation needed per selector. */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
