import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/routing/PrivateRoute';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';

import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { PlaysList } from './pages/plays/PlaysList';
import { PlayEditor } from './pages/plays/PlayEditor';
import { UserProfile } from './pages/profile/UserProfile';
import { Preferences } from './pages/preferences/Preferences';
import { LegalNotice, PrivacyPolicy, TermsOfService } from './pages/legal';
import { NotFound } from './pages/NotFound';
import DevPlayground from './pages/DevPlayground';
import LibraryPage from './pages/LibraryPage';
import EditorPage from './pages/EditorPage';
import AuthPage from './pages/dev/AuthPage';
import LegalPage from './pages/dev/LegalPage';

function RootRedirect() {
  const { user, guestMode } = useAuth();

  if (user || guestMode) {
    return <Navigate to="/plays" replace />;
  }
  return <Navigate to="/login" replace />;
}

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
            <Route path="/" element={<RootRedirect />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/legal" element={<LegalNotice />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />

            {import.meta.env.DEV && (
              <>
                <Route path="/dev" element={<DevPlayground />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/editor/:id" element={<EditorPage />} />
                <Route path="/dev/auth" element={<AuthPage />} />
                <Route path="/dev/legal/:docType" element={<LegalPage />} />
              </>
            )}

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
