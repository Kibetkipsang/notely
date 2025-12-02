import { create } from "zustand";

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
  setUser: (user: UserType) => void;
  clearUser: () => void;
};

const useAuthStore = create<AuthStore>((set) => ({
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null,

  setUser: (user) => {
    set({ user });
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
  },

  clearUser: () => {
    set({ user: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
  },
}));

export default useAuthStore;
