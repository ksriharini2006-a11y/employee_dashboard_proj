import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient, { setAccessToken } from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const res = await axiosClient.post('/auth/refresh');
        setAccessToken(res.data.data.accessToken);
        setUser(res.data.data.user);
      } catch (err) {
        setAccessToken(null);
        setUser(null);
      } finally {
        setChecking(false);
      }
    };
    tryRefresh();
  }, []);

  const login = (data) => {
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (err) {
      // Even if the network call fails, clear local state
    }
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, checking, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);