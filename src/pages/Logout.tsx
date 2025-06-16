import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';
import { useBootstrapDataStore } from '../states/stores/useBootstrapDataStore';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { destroyBootstrapData } = useBootstrapDataStore();

  useEffect(() => {
    const handleLogout = async () => {
      console.log('Logging out...');
      try {
        await logout(); // This calls supabase.auth.signOut() and setUser(null)
        destroyBootstrapData(); // Clear any bootstrap data
        console.log('User logged out successfully');
        navigate('/login'); // Redirect after logout
      } catch (err) {
        console.error('Logout route failed:', err);
      }
    };

    handleLogout();
  }, [logout, navigate]);

    return (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      );
};

export default Logout;