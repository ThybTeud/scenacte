import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/routing/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';

import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { PlaysList } from './pages/plays/PlaysList';
import { PlayEditor } from './pages/plays/PlayEditor';
import { UserProfile } from './pages/profile/UserProfile';
import { Preferences } from './pages/preferences/Preferences';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#363636',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Routes>
            <Route path="/" element={<Navigate to="/plays" replace />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              path="/plays"
              element={
                <PrivateRoute>
                  <PlaysList />
                </PrivateRoute>
              }
            />
            <Route
              path="/plays/:id"
              element={
                <PrivateRoute>
                  <PlayEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute requireAuth>
                  <UserProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/preferences"
              element={
                <PrivateRoute requireAuth>
                  <Preferences />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
