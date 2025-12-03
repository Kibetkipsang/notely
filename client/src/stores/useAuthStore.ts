import { create } from "zustand";
import { persist } from 'zustand/middleware'; // Add this import

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
        set({ user });
        if (token) {
          set({ token });
          // Also store token in localStorage for axios interceptor
          localStorage.setItem('token', token);
        }
      },
      
      clearUser: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;