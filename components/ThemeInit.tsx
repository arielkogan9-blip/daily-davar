"use client";

import { useLayoutEffect } from "react";

/**
 * Applies the saved theme synchronously before the first paint.
 * useLayoutEffect fires before the browser paints, so there is no
 * visible flash — even for dark-mode users.
 */
export default function ThemeInit() {
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem("dd_theme");
      if (saved === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
    } catch {
      // localStorage unavailable (SSR, private browsing) — do nothing
    }
  }, []);

  return null;
}
