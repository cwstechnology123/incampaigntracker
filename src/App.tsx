import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RequireSessionAndBootstrap  from './components/RequireSessionAndBootstrap';
import { AuthProvider } from './contexts/AuthContext';
import { CampaignsProvider } from './contexts/CampaignsContext';
import { PrivateRoute } from './routes/PrivateRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { CampaignsPage } from './pages/CampaignPages';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { SettingsPage } from './pages/SettingsPage';
import Logout from './pages/Logout';
import { SkeletonDashboard } from './components/ui/SkeletonDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            
            <Route 
              path="dashboard" 
              element={
                <PrivateRoute>
                  <RequireSessionAndBootstrap fallback={<SkeletonDashboard />}>
                    <DashboardPage />
                  </RequireSessionAndBootstrap>
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="campaigns/*" 
              element={
                <PrivateRoute>
                  <RequireSessionAndBootstrap fallback={<div>Loading app...</div>}>
                    <CampaignsProvider>
                      <CampaignsPage />
                    </CampaignsProvider>
                  </RequireSessionAndBootstrap>
                </PrivateRoute>
              } 
            />

            <Route 
              path="settings" 
              element={
                <PrivateRoute>
                  <RequireSessionAndBootstrap fallback={<div>Loading app...</div>}>
                    <SettingsPage />
                  </RequireSessionAndBootstrap>
                </PrivateRoute>
              } 
            />
            <Route path="/logout" element={<PrivateRoute><Logout /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;