// =============================================================
//  storefront/src/contexts/ThemeContext.jsx
//  Manages light / dark mode toggle.
//  Theme is persisted in localStorage so it survives page refresh.
// =============================================================

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Read saved theme from localStorage, default to "light"
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    // Apply theme to <html> element so CSS variables kick in
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for easy consumption
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}