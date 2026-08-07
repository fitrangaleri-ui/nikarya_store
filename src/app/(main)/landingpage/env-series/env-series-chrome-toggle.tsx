"use client";

import { useEffect } from "react";

export function EnvSeriesChromeToggle() {
  useEffect(() => {
    document.body.classList.add("env-series-hide-chrome");

    return () => {
      document.body.classList.remove("env-series-hide-chrome");
    };
  }, []);

  return null;
}
