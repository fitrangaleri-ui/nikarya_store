"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type FilterDrawerContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
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

  const value = useMemo<FilterDrawerContextValue>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen],
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
