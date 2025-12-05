import { create } from "zustand";
import { persist } from 'zustand/middleware';

type UserType = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  emailAddress: string;
  role: string;
};

type AuthStore = {
  user: UserType | null;
  token: string | null;
  setUser: (user: UserType, token?: string) => void;
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
          // Only store token in localStorage here
          localStorage.setItem('token', token);
        } else {
          set({ user });
        }
      },
      
      clearUser: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage'); // Clear Zustand's persisted state too
      },
    }),
    {
      name: 'auth-storage',
      // Optional: Exclude token from persistence since we're storing it separately
      // partialize: (state) => ({ user: state.user })
    }
  )
);

export default useAuthStore;