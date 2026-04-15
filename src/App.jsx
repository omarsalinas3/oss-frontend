import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowRegister(false);
  };

  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'var(--bg-panel)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)'
          }
        }}
      />
      
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <main style={{ padding: '0 20px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           {!isAuthenticated ? (
             showRegister ? 
             <RegisterForm onSwitchToLogin={() => setShowRegister(false)} /> :
             <LoginForm onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setShowRegister(true)} />
           ) : (
            <Dashboard onLogout={handleLogout} />
           )}
        </main>
      </div>
    </>
  );
}

export default App;
