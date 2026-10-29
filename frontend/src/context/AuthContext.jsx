import React, { createContext, useState, useEffect } from 'react';
import api from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) setUser(JSON.parse(userInfo));
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/api/auth/register', { name, email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('userInfo', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return <AuthContext.Provider value={{ user, login, register, updateUser, logout }}>{children}</AuthContext.Provider>;
};
