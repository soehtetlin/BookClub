import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { Layout } from './components/Layout'
import { ProtectedRoute, VerifiedRoute } from './components/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { HomePage } from './pages/HomePage'
import { CreateSessionPage } from './pages/CreateSessionPage'
import { SessionDetailPage } from './pages/SessionDetailPage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 30_000,
    },
  },
})

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/sessions/:id" element={<SessionDetailPage />} />

          <Route element={<VerifiedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/sessions/new" element={<CreateSessionPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <LanguageProvider>
              <AppRoutes />
            </LanguageProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
