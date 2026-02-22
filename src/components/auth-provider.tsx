"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type AuthContextType = {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    signOut: async () => { },
});

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    // Client-side sign out handler
    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        router.push("/login");
        router.refresh();
    }, [supabase, router]);

    useEffect(() => {
        // 1. Session check on app load
        const getInitialSession = async () => {
            try {
                const {
                    data: { session: currentSession },
                } = await supabase.auth.getSession();

                setSession(currentSession);
                setUser(currentSession?.user ?? null);
            } catch (error) {
                console.error("Error getting initial session:", error);
            } finally {
                setIsLoading(false);
            }
        };

        getInitialSession();

        // 2. Auth state listener
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, newSession) => {
            console.log("Auth state changed:", event);

            setSession(newSession);
            setUser(newSession?.user ?? null);
            setIsLoading(false);

            switch (event) {
                case "SIGNED_IN":
                    // Session updated — router.refresh will re-validate server components
                    router.refresh();
                    break;

                case "SIGNED_OUT":
                    setUser(null);
                    setSession(null);
                    break;

                case "TOKEN_REFRESHED":
                    // Session silently refreshed — no UI action needed
                    break;

                case "PASSWORD_RECOVERY":
                    // User arrived via password recovery link
                    // The reset-password page handles this flow
                    router.push("/reset-password");
                    break;
            }
        });

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, router]);

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
