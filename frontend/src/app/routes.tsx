import { Navigate, createBrowserRouter } from 'react-router-dom'
import { ApplicationLayout } from '../components/layout/ApplicationLayout'
import { AuthLayout } from '../components/layout/AuthLayout'
import { LandingLayout } from '../components/layout/LandingLayout'
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { SignUpPage } from '../features/auth/pages/SignUpPage'
import { LandingPage } from '../features/landing/pages/LandingPage'
import { DashboardPage } from '../features/workspace/pages/DashboardPage'

export const router = createBrowserRouter([
  { element: <LandingLayout />, children: [{ index: true, element: <LandingPage /> }] },
  { element: <AuthLayout />, children: [
    { path: '/login', element: <LoginPage /> },
    { path: '/sign-up', element: <SignUpPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
  ] },
  { path: '/app', element: <ApplicationLayout />, children: [
    { index: true, element: <Navigate to="dashboard" replace /> },
    { path: 'dashboard', element: <DashboardPage /> },
    { path: 'new-analysis', lazy: async () => ({ Component: (await import('../features/workspace/pages/NewAnalysisPage')).NewAnalysisPage }) },
    { path: 'reports/current', lazy: async () => ({ Component: (await import('../features/workspace/pages/AnalysisReportPage')).AnalysisReportPage }) },
    { path: 'reports/:reportId', lazy: async () => ({ Component: (await import('../features/workspace/pages/AnalysisReportPage')).AnalysisReportPage }) },
    { path: 'text-analysis', lazy: async () => ({ Component: (await import('../features/workspace/pages/TextAnalysisPage')).TextAnalysisPage }) },
    { path: 'image-analysis', lazy: async () => ({ Component: (await import('../features/workspace/pages/ImageAnalysisPage')).ImageAnalysisPage }) },
    { path: 'history', lazy: async () => ({ Component: (await import('../features/workspace/pages/HistoryPage')).HistoryPage }) },
    { path: 'saved-reports', lazy: async () => ({ Component: (await import('../features/workspace/pages/SavedReportsPage')).SavedReportsPage }) },
    { path: 'analytics', lazy: async () => ({ Component: (await import('../features/workspace/pages/AnalyticsPage')).AnalyticsPage }) },
    { path: 'intelligence', lazy: async () => ({ Component: (await import('../features/workspace/pages/IntelligenceCenterPage')).IntelligenceCenterPage }) },
    { path: 'compare-reports', lazy: async () => ({ Component: (await import('../features/workspace/pages/CompareReportsPage')).CompareReportsPage }) },
    { path: 'community-intelligence', lazy: async () => ({ Component: (await import('../features/workspace/pages/CommunityIntelligencePage')).CommunityIntelligencePage }) },
    { path: 'settings', lazy: async () => ({ Component: (await import('../features/workspace/pages/SettingsPage')).SettingsPage }) },
    { path: 'profile', lazy: async () => ({ Component: (await import('../features/workspace/pages/ProfilePage')).ProfilePage }) },
    { path: 'help', lazy: async () => ({ Component: (await import('../features/workspace/pages/HelpPage')).HelpPage }) },
    { path: 'about', lazy: async () => ({ Component: (await import('../features/workspace/pages/AboutPage')).AboutPage }) },
    { path: '*', element: <Navigate to="dashboard" replace /> },
  ] },
])
