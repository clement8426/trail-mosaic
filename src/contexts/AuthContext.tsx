
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { toast } from "sonner";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock authentication - would be replaced with a real auth provider like Firebase or Supabase
  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('trailMosaicUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock login - would call an API in a real app
      console.log('Logging in with:', email, password);
      
      // Create a mock user for demonstration
      const user: User = {
        id: '123',
        email,
        username: email.split('@')[0],
        createdAt: new Date().toISOString(),
        favorites: []
      };
      
      localStorage.setItem('trailMosaicUser', JSON.stringify(user));
      setCurrentUser(user);
      toast.success("Connexion réussie");
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Erreur de connexion");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      // Mock Google login - would use OAuth in a real app
      console.log('Logging in with Google');
      
      // Create a mock Google user
      const user: User = {
        id: 'google123',
        email: 'user@example.com',
        username: 'GoogleUser',
        photoURL: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1887&auto=format&fit=crop',
        createdAt: new Date().toISOString(),
        favorites: []
      };
      
      localStorage.setItem('trailMosaicUser', JSON.stringify(user));
      setCurrentUser(user);
      toast.success("Connexion Google réussie");
      
    } catch (error) {
      console.error('Google login error:', error);
      toast.error("Erreur de connexion Google");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      // Mock registration - would call an API in a real app
      console.log('Registering with:', email, password, username);
      
      // Create a new user
      const user: User = {
        id: Date.now().toString(),
        email,
        username,
        createdAt: new Date().toISOString(),
        favorites: []
      };
      
      localStorage.setItem('trailMosaicUser', JSON.stringify(user));
      setCurrentUser(user);
      toast.success("Inscription réussie");
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Erreur d'inscription");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Mock logout
      localStorage.removeItem('trailMosaicUser');
      setCurrentUser(null);
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Erreur de déconnexion");
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      // Mock password reset - would send an email in a real app
      console.log('Password reset for:', email);
      toast.success("Instructions de réinitialisation envoyées à votre email");
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error("Erreur lors de la demande de réinitialisation");
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    forgotPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
