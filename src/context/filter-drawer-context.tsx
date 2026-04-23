"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type FilterDrawerContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const FilterDrawerContext = createContext<FilterDrawerContextValue | null>(
  null,
);

export function FilterDrawerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => {
    setIsOpen((current) => !current);
  }, []);

  const value = useMemo<FilterDrawerContextValue>(
    () => ({
      isOpen,
      open,
      close,
      toggle,
    }),
    [close, isOpen, open, toggle],
  );

  return (
    <FilterDrawerContext.Provider value={value}>
      {children}
    </FilterDrawerContext.Provider>
  );
}

export function useFilterDrawer() {
  const ctx = useContext(FilterDrawerContext);
  if (!ctx) {
    throw new Error(
      "useFilterDrawer must be used within <FilterDrawerProvider />",
    );
  }
  return ctx;
}
