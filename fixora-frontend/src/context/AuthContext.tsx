// This file will manage the user's session.
"use client";
import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo, useCallback } from 'react';

// Define the shape of a user object
interface User {
  id: string,
  fullName: string,
  email: string,
  role: string,
  twoFactorEnabled?: boolean
}

// Define the shape of the context's value
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Check for a token in localStorage on initial load
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');
      
      // Validate and parse stored data
      if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
        setToken(storedToken);
      }
      
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Validate that parsedUser has required properties
          if (parsedUser && parsedUser.id && parsedUser.fullName && parsedUser.email) {
            setUser(parsedUser);
          } else {
            // Invalid user data, clear it
            localStorage.removeItem('authUser');
          }
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
          // Clear corrupted data
          localStorage.removeItem('authUser');
        }
      }
    } catch (error) {
      console.error('Error loading auth data from localStorage:', error);
      // Clear all auth data if there's an error
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((userData: User, token: string) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem('authUser', JSON.stringify(userData));
    localStorage.setItem('authToken', token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
    }
  }, [user]);

  const value = useMemo(() => ({ 
    user, 
    token, 
    isLoading, 
    login, 
    logout,
    updateUser
  }), [user, token, isLoading, login, logout, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook for easy context access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};