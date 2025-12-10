import { create } from "zustand";
import { persist } from 'zustand/middleware';

type UserType = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  emailAddress: string;
  role: string;
  avatarUrl?: string;
};

type AuthStore = {
  user: UserType | null;
  token: string | null;
  setUser: (user: UserType, token?: string) => void;
  updateUser: (updates: Partial<UserType>) => void; // Add this
  clearUser: () => void;
};

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      
      setUser: (user, token) => {
        if (token) {
          set({ user, token });
          localStorage.setItem('token', token);
        } else {
          set({ user });
        }
      },
      
      // Add this method to update user fields
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }));
      },
      
      clearUser: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;