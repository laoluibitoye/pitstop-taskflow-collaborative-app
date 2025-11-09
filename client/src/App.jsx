<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { useStore } from './store/useStore';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import GuestLogin from './components/auth/GuestLogin';
import Dashboard from './pages/Dashboard';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/guest" element={<GuestLogin />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
=======
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import { authAPI } from './services/api';
import { SocketProvider } from './contexts/SocketContext';

// Placeholder for actual components
const HomePage = () => <h1>Welcome to TaskFlow!</h1>;
const LoginPage = () => <h1>Login Page</h1>;
const RegisterPage = () => <h1>Register Page</h1>;
const DashboardPage = () => <h1>Dashboard Page</h1>;
const AdminPage = () => <h1>Admin Page</h1>;
const NotFoundPage = () => <h1>404 Not Found</h1>;

function App() {
  const { setUser, setToken, token } = useStore();

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getCurrentUser();
          setUser(res.data.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          setToken(null); // Clear invalid token
        }
      }
    };
    loadUser();
  }, [token, setUser, setToken]);

  return (
    <SocketProvider>
      <Router>
        <Toaster />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </SocketProvider>
>>>>>>> be5354fc331270757815a3ee02528af8d63129cc
  );
}

export default App;