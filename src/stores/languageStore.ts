import { create } from 'zustand';
import i18n from '../config/i18n';
import { AsyncStorage } from 'expo-sqlite/kv-store';
import { I18nManager } from 'react-native';

interface LanguageStore {
  currentLanguage: string;
  isChanging: boolean;
  changeLanguage: (lang: 'en' | 'ar' | 'fa') => Promise<void>;
  loadLanguage: () => Promise<void>;
}

const LANGUAGE_KEY = '@userLanguage';
const DEFAULT_LANGUAGE = 'en';

// Track if we're already handling a language change to prevent recursion
let isChangingLanguage = false;

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  currentLanguage: DEFAULT_LANGUAGE,
  isChanging: false,
  
  loadLanguage: async () => {
    if (isChangingLanguage) return;
    
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      
      if (savedLanguage && ['en', 'ar', 'fa'].includes(savedLanguage)) {
        isChangingLanguage = true;
        
        // Check if RTL needs to be enabled
        const isRTL = savedLanguage === 'ar' || savedLanguage === 'fa';
        if (I18nManager.isRTL !== isRTL) {
          I18nManager.forceRTL(isRTL);
          // Note: Requires app restart for RTL to fully apply
        }
        
        await i18n.changeLanguage(savedLanguage);
        set({ currentLanguage: savedLanguage });
        
        isChangingLanguage = false;
      } else {
        set({ currentLanguage: DEFAULT_LANGUAGE });
      }
    } catch (error) {
      console.error('Failed to load language:', error);
      isChangingLanguage = false;
      set({ currentLanguage: DEFAULT_LANGUAGE });
    }
  },
  
  changeLanguage: async (lang) => {
    // Prevent any concurrent changes
    if (isChangingLanguage) {
      console.log('Language change already in progress, ignoring...');
      return;
    }
    
    const { currentLanguage } = get();
    
    if (currentLanguage === lang) {
      console.log('Already using language:', lang);
      return;
    }
    
    // Set both flags
    isChangingLanguage = true;
    set({ isChanging: true });
    
    try {
      console.log(`Changing language: ${currentLanguage} → ${lang}`);
      
      // Check if RTL needs to be changed
      const wasRTL = currentLanguage === 'ar' || currentLanguage === 'fa';
      const isRTL = lang === 'ar' || lang === 'fa';
      
      // Save to storage
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      
      // Change i18n language (this is async and might trigger re-renders)
       i18n.changeLanguage(lang);
      
      // Update store AFTER i18n has changed
      set({ currentLanguage: lang, isChanging: false });
      
      // Handle RTL change if needed
      if (wasRTL !== isRTL && I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
        
        // Alert user that app needs restart for RTL changes
        console.log('RTL changed, app restart may be required');
        // You can show an alert here if needed
      }
      
      console.log('Language changed successfully to:', lang);
      isChangingLanguage = false;
      
    } catch (error) {
      console.error('Failed to change language:', error);
      isChangingLanguage = false;
      set({ isChanging: false });
      throw error;
    }
  },
}));