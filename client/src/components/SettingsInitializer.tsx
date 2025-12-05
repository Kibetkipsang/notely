// components/SettingsInitializer.tsx - SIMPLIFIED VERSION
import { useEffect } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import useAuthStore from '../stores/useAuthStore';

export const SettingsInitializer = () => {
  const { user } = useAuthStore();
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    // Fetch settings if user is logged in and we don't have them yet
    if (user && !settings) {
      console.log('Fetching settings for user:', user.emailAddress); // Debug
      fetchSettings();
    }
  }, [user, fetchSettings, settings]);

  return null; 
};