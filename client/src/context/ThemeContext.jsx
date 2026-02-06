import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/api';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('forest');
  const [darkMode, setDarkMode] = useState(false);
  const [font, setFont] = useState('default');

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Set theme
    root.setAttribute('data-theme', theme === 'forest' ? '' : theme);

    // Set dark mode
    if (darkMode) {
      root.setAttribute('data-mode', 'dark');
      root.setAttribute('data-theme', (theme === 'forest' ? 'dark' : theme));
    } else {
      root.removeAttribute('data-mode');
      if (theme === 'forest') {
        root.removeAttribute('data-theme');
      }
    }

    // Set font
    const fontFamilies = {
      default: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
      handwritten: "'Caveat', cursive",
      classic: "Georgia, 'Times New Roman', serif",
      modern: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    };

    document.body.style.fontFamily = fontFamilies[font] || fontFamilies.default;
  }, [theme, darkMode, font]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('memora-theme');
    const savedDarkMode = localStorage.getItem('memora-darkmode');
    const savedFont = localStorage.getItem('memora-font');

    if (savedTheme) setTheme(savedTheme);
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
    if (savedFont) setFont(savedFont);
  }, []);

  // Fetch user settings from server when authenticated
  const loadUserSettings = async () => {
    try {
      const res = await getProfile();
      if (res.data.settings) {
        const { theme: userTheme, darkMode: userDarkMode, font: userFont } = res.data.settings;
        if (userTheme) {
          setTheme(userTheme);
          localStorage.setItem('memora-theme', userTheme);
        }
        if (typeof userDarkMode === 'boolean') {
          setDarkMode(userDarkMode);
          localStorage.setItem('memora-darkmode', String(userDarkMode));
        }
        if (userFont) {
          setFont(userFont);
          localStorage.setItem('memora-font', userFont);
        }
      }
    } catch (err) {
      // User not logged in or error - use local settings
    }
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('memora-theme', newTheme);
  };

  const updateDarkMode = (enabled) => {
    setDarkMode(enabled);
    localStorage.setItem('memora-darkmode', String(enabled));
  };

  const updateFont = (newFont) => {
    setFont(newFont);
    localStorage.setItem('memora-font', newFont);
  };

  const value = {
    theme,
    darkMode,
    font,
    setTheme: updateTheme,
    setDarkMode: updateDarkMode,
    setFont: updateFont,
    loadUserSettings
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
