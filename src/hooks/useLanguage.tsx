import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getTranslation } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'steadysteps_language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'en' || stored === 'es') return stored;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  // Function to sync language from profile (called after login)
  const syncLanguageFromProfile = (profileLanguage: Language | undefined) => {
    if (profileLanguage && (profileLanguage === 'en' || profileLanguage === 'es')) {
      setLanguageState(profileLanguage);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, profileLanguage);
    }
  };

  const t = (path: string): string => {
    return getTranslation(language, path);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Export a function to sync language from profile (used by auth flow)
export const getStoredLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'es') return stored;
  }
  return 'en';
};

export const setStoredLanguage = (lang: Language) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
};
