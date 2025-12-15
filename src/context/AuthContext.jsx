import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { getEnvironment } from '../services/dataService';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const environment = getEnvironment();
    const needsAuth = environment === 'web';

    useEffect(() => {
        if (!needsAuth || !isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [needsAuth]);

    const signUp = async (email, password) => {
        setError(null);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) {
            setError(error.message);
            throw error;
        }
        return data;
    };

    const signIn = async (email, password) => {
        setError(null);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            setError(error.message);
            throw error;
        }
        return data;
    };

    const signInWithGoogle = async () => {
        setError(null);
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) {
            setError(error.message);
            throw error;
        }
        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            setError(error.message);
            throw error;
        }
        setUser(null);
    };

    const resetPassword = async (email) => {
        setError(null);
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
            setError(error.message);
            throw error;
        }
        return data;
    };

    const value = {
        user,
        loading,
        error,
        environment,
        needsAuth,
        isAuthenticated: !needsAuth || !!user,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;



