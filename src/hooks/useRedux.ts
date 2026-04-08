/**
 * Redux Hooks
 * Typed hooks for accessing Redux store
 */

import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';

/**
 * Pre-typed useDispatch hook
 * Use this instead of plain useDispatch
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Pre-typed useSelector hook
 * Use this instead of plain useSelector
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
