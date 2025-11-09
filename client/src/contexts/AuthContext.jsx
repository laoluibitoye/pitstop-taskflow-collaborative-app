import { createContext, useContext, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { user, token, isAuthenticated, setUser, setToken, logout, setLoading } = useStore();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const { data } = await authAPI.getCurrentUser();
          setUser(data);
          setToken(storedToken);
        } catch (error) {
          console.error('Auth init failed:', error);
          logout();
        }
      }
    };
    initAuth();
  }, []);

  const register = async (userData) => {
    try {
      setLoading(true);
      const { data } = await authAPI.register(userData);
      setToken(data.token);
      setUser(data.user);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const { data } = await authAPI.login(credentials);
      setToken(data.token);
      setUser(data.user);
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async (guestName) => {
    try {
      setLoading(true);
      const { data } = await authAPI.createGuest(guestName);
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome, ${guestName}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Guest login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const convertGuestToUser = async (userData) => {
    try {
      setLoading(true);
      const { data } = await authAPI.convertGuest(userData);
      setToken(data.token);
      setUser(data.user);
      toast.success('Account created! You can now log in anytime.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Conversion failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        isAuthenticated, 
        register, 
        login, 
        loginAsGuest,
        convertGuestToUser,
        logout: handleLogout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};