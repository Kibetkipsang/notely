// components/SettingsInitializer.tsx
import { useEffect } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import  useAuthStore  from '../stores/useAuthStore';

export const SettingsInitializer = () => {
  const { user } = useAuthStore();
  const { settings, fetchSettings, applyDarkMode } = useSettingsStore();

  useEffect(() => {
    // Apply dark mode from localStorage on initial load
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Fetch settings if user is logged in
    if (user && !settings) {
      fetchSettings();
    }
  }, [user, fetchSettings, settings]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return null; 
};