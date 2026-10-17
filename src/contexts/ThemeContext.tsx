import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
type Theme = 'light' | 'dark' | 'system';
const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
} | null>(null);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const v = localStorage.getItem('conxee-theme');
      return v === 'dark' || v === 'system' ? v : 'light';
    } catch {
      return 'light';
    }
  });
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(
        theme === 'system' ? (media.matches ? 'dark' : 'light') : theme,
      );
    };
    apply();
    try {
      localStorage.setItem('conxee-theme', theme);
    } catch {
      /* Storage may be unavailable. */
    }
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw Error('useTheme requires ThemeProvider');
  return value;
}
