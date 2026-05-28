"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolved: "light",
  setTheme: () => {},
});

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getSnapshot = () => {
  return (localStorage.getItem("eventsync_theme") as Theme | null) || "system";
};

const getServerSnapshot = () => {
  return "system" as Theme; 
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const apply = (t: Theme) => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = t === "dark" || (t === "system" && prefersDark);
      document.documentElement.classList.toggle("dark", isDark);
      setResolved(isDark ? "dark" : "light");
    };

    apply(theme);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => { if (theme === "system") apply("system"); };
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [theme]);

  function setTheme(t: Theme) {
    if (typeof window !== "undefined") {
      localStorage.setItem("eventsync_theme", t);
      window.dispatchEvent(new Event("storage"));
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}