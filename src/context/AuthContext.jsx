import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentAdmin,
  subscribeToAuthChanges
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAdmin() {
      try {
        const currentAdmin = await getCurrentAdmin();

        if (mounted) {
          setAdmin(currentAdmin);
        }
      } catch (error) {
        console.error("Unable to load administrator session:", error);

        if (mounted) {
          setAdmin(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAdmin();

    const {
      data: { subscription }
    } = subscribeToAuthChanges(async () => {
      const currentAdmin = await getCurrentAdmin();

      if (mounted) {
        setAdmin(currentAdmin);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}
