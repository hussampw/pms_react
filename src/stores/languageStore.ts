import { create } from 'zustand';
import i18n from '../config/i18n';
import { AsyncStorage } from 'expo-sqlite/kv-store';

interface LanguageStore {
  currentLanguage: string;
  changeLanguage: (lang: 'en' | 'ar' | 'fa') => Promise<void>;
  loadLanguage: () => Promise<void>;
}

const LANGUAGE_KEY = '@userLanguage';
const DEFAULT_LANGUAGE = 'en';

// Initialize with default, then load from storage
const getCurrentLanguage = (): string => {
  // Start with i18n's current language or default
  return i18n.language || DEFAULT_LANGUAGE;
};

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  currentLanguage: getCurrentLanguage(),
  
  // Load language from AsyncStorage on app start
  loadLanguage: async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage && ['en', 'ar', 'fa'].includes(savedLanguage)) {
        // Update both i18n and store
        await i18n.changeLanguage(savedLanguage);
        set({ currentLanguage: savedLanguage });
      } else {
        // Use i18n's current language
        const currentLang = i18n.language || DEFAULT_LANGUAGE;
        set({ currentLanguage: currentLang });
      }
    } catch (error) {
      console.error('Failed to load language from storage:', error);
      // Fallback to i18n's current language
      set({ currentLanguage: getCurrentLanguage() });
    }
  },
  
  changeLanguage: async (lang) => {
    const current = get().currentLanguage;
    
    // Prevent changing to the same language
    if (current === lang) {
      return;
    }
    
    try {
      // Save to AsyncStorage first
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      
      // Change i18n language
      await i18n.changeLanguage(lang);
      
      // Update store
      set({ currentLanguage: lang });
    } catch (error) {
      console.error('Failed to change language:', error);
      // Revert on error
      set({ currentLanguage: getCurrentLanguage() });
      throw error;
    }
  },
}));