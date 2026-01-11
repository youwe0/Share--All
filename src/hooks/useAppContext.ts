import type { AppContextValue } from "../context/AppContext";
import { useContext } from "react";
import AppContext from "../context/AppContext";

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
