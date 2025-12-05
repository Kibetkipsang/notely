// stores/useSettingsStore.ts - WITHOUT DARK MODE
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  emailNotifications: boolean;
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
  settings: Settings;
  isUpdating: boolean;
  error: string | null;
  
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  setLanguage: (language: string) => void;
}

const defaultSettings: Settings = {
  emailNotifications: true,
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
      settings: defaultSettings,
      isUpdating: false,
      error: null,

      updateSettings: async (newSettings: Partial<Settings>) => {
        try {
          set({ isUpdating: true, error: null });
          const currentSettings = get().settings;
          const updatedSettings = { ...currentSettings, ...newSettings };
          
          // Update local state first for immediate UI update
          set({ settings: updatedSettings });
          
          // Apply language change to DOM if needed
          if (newSettings.language !== undefined) {
            document.documentElement.setAttribute('lang', newSettings.language);
          }
          
          // Optional: Sync with backend
          // const response = await api.put('/auth/settings', updatedSettings);
          // if (!response.data.success) throw new Error('Update failed');
          
        } catch (error: any) {
          set({ 
            error: error?.response?.data?.message || 'Failed to update settings',
            settings: get().settings // Revert to previous
          });
          throw error;
        } finally {
          set({ isUpdating: false });
        }
      },

      setLanguage: (language: string) => {
        const currentSettings = get().settings;
        
        set({
          settings: { ...currentSettings, language }
        });
        
        document.documentElement.setAttribute('lang', language);
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ settings: state.settings }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state?.settings) {
          // Apply language after Zustand rehydrates
          if (state.settings.language) {
            document.documentElement.setAttribute('lang', state.settings.language);
          }
        }
      },
    }
  )
);