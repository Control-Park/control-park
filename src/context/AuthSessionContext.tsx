import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";

type AuthSessionContextValue = {
  displayName: string;
  isAuthenticated: boolean;
  isGuest: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
};

const AuthSessionContext = createContext<AuthSessionContextValue>({
  displayName: "Guest",
  isAuthenticated: false,
  isGuest: true,
  loading: true,
  session: null,
  user: null,
});

const getDisplayName = (user: User | null) => {
  if (!user) {
    return "Guest";
  }

  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";
  const firstName =
    typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
  const lastName =
    typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";

  if (fullName) {
    return fullName;
  }

  const combinedName = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (combinedName) {
    return combinedName;
  }

  const emailPrefix = user.email?.split("@")[0]?.trim();
  if (emailPrefix) {
    return emailPrefix;
  }

  return "Guest";
};

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (__DEV__) {
        console.log("[auth] initial session", {
          email: data.session?.user?.email ?? null,
          error: error?.message ?? null,
          userId: data.session?.user?.id ?? null,
        });
      }

      if (!isMounted) {
        return;
      }

      setSession(data.session ?? null);
      setLoading(false);
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (__DEV__) {
        console.log("[auth] state change", {
          email: nextSession?.user?.email ?? null,
          event,
          userId: nextSession?.user?.id ?? null,
        });
      }

      setSession(nextSession ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    const user = session?.user ?? null;

    return {
      displayName: getDisplayName(user),
      isAuthenticated: !!user,
      isGuest: !user,
      loading,
      session,
      user,
    };
  }, [loading, session]);

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  return useContext(AuthSessionContext);
}
