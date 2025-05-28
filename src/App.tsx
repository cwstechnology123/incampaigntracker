import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CampaignsProvider } from './contexts/CampaignsContext';
import { PostsProvider } from './contexts/PostsContext';
import { PrivateRoute } from './routes/PrivateRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { CampaignsPage } from './pages/CampaignPages';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <CampaignsProvider>
        <PostsProvider>
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
                      <DashboardPage />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="campaigns/*" 
                  element={
                    <PrivateRoute>
                      <CampaignsPage />
                    </PrivateRoute>
                  } 
                />

                <Route 
                  path="settings" 
                  element={
                    <PrivateRoute>
                      <SettingsPage />
                    </PrivateRoute>
                  } 
                />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </PostsProvider>
      </CampaignsProvider>
    </AuthProvider>
  );
}

export default App;