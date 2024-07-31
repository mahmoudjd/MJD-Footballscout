import * as React from "react";

type AppContextType = {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AppContext = React.createContext<AppContextType>({
  isDark: true,
  setIsDark: () => {},
});
