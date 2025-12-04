import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../axios';

interface Settings {
  emailNotifications: boolean;
  darkMode: boolean;
  language: string;
  timezone: string;
  pushNotifications: boolean;
  soundEnabled: boolean;
  notificationPreferences?: {
    newNote: boolean;
    noteUpdated: boolean;
    trashCleared: boolean;
    weeklySummary: boolean;
    securityAlerts: boolean;
  };
}

interface SettingsStore {
  settings: Settings | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  
  // Actions
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  applyDarkMode: () => void;
  applyLanguage: () => void;
  reset: () => void;
}

const defaultSettings: Settings = {
  emailNotifications: true,
  darkMode: false,
  language: 'en',
  timezone: 'UTC',
  pushNotifications: true,
  soundEnabled: true,
  notificationPreferences: {
    newNote: true,
    noteUpdated: true,
    trashCleared: false,
    weeklySummary: true,
    securityAlerts: true,
  },
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: null,
      isLoading: false,
      isUpdating: false,
      error: null,

      fetchSettings: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await api.get('/auth/settings');
          
          if (response.data.success && response.data.data) {
            const settings = {
              ...defaultSettings,
              ...response.data.data,
              notificationPreferences: {
                ...defaultSettings.notificationPreferences,
                ...(response.data.data.notificationPreferences || {}),
              },
            };
            
            set({ settings });
            
            // Apply settings immediately
            get().applyDarkMode();
            get().applyLanguage();
          }
        } catch (error: any) {
          set({ 
            error: error?.response?.data?.message || 'Failed to fetch settings',
            settings: defaultSettings 
          });
          
          // Apply default settings
          get().applyDarkMode();
          get().applyLanguage();
        } finally {
          set({ isLoading: false });
        }
      },

      updateSettings: async (newSettings: Partial<Settings>) => {
        try {
          set({ isUpdating: true, error: null });
          const currentSettings = get().settings || defaultSettings;
          const updatedSettings = { ...currentSettings, ...newSettings };
          
          const response = await api.put('/auth/settings', updatedSettings);
          
          if (response.data.success) {
            set({ settings: updatedSettings });
            
            // Apply settings immediately
            if (newSettings.darkMode !== undefined) {
              get().applyDarkMode();
            }
            if (newSettings.language) {
              get().applyLanguage();
            }
          }
        } catch (error: any) {
          set({ 
            error: error?.response?.data?.message || 'Failed to update settings' 
          });
          throw error;
        } finally {
          set({ isUpdating: false });
        }
      },

      applyDarkMode: () => {
        const settings = get().settings;
        const darkMode = settings?.darkMode ?? defaultSettings.darkMode;
        
        if (darkMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      },

      applyLanguage: () => {
        const settings = get().settings;
        const language = settings?.language ?? defaultSettings.language;
        
        // You can implement i18n here
        // For now, just set a data attribute
        document.documentElement.setAttribute('lang', language);
        localStorage.setItem('language', language);
        
        // Dispatch event for components to listen to
        window.dispatchEvent(new CustomEvent('languageChanged', { 
          detail: { language } 
        }));
      },

      reset: () => {
        set({ 
          settings: defaultSettings,
          isLoading: false,
          isUpdating: false,
          error: null 
        });
        get().applyDarkMode();
        get().applyLanguage();
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);