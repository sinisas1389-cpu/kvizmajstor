import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMockCurrentUser, mockLogin, mockSignup, mockLogout } from '../utils/mock';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getMockCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const user = await mockLogin(email, password);
    setUser(user);
    return user;
  };

  const signup = async (email, username, password) => {
    const user = await mockSignup(email, username, password);
    setUser(user);
    return user;
  };

  const logout = () => {
    mockLogout();
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};