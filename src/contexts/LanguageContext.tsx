import React, { createContext, useContext, useState } from 'react';
import { en } from '../locales/en';
import { my } from '../locales/my';

type Language = 'en' | 'my';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, any> = { en, my };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'my') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const langData = translations[language];
    const parts = key.split('.');
    let result = langData;

    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return key; // Fallback to raw key if path not found
      }
    }

    if (typeof result !== 'string') {
      return key;
    }

    // Handle replacements/interpolation
    if (replacements) {
      let interpolated = result;
      for (const [placeholder, val] of Object.entries(replacements)) {
        interpolated = interpolated.replace(new RegExp(`{${placeholder}}`, 'g'), String(val));
      }
      return interpolated;
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
