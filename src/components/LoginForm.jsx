import { useState } from 'react';
import toast from 'react-hot-toast';
import { sanitizeInput, isValidUsername, isValidPassword } from '../utils/security';
import api from '../utils/api';

export default function LoginForm({ onLoginSuccess, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const sanitizedUsername = sanitizeInput(formData.username);
    const sanitizedPassword = formData.password; 

    if (!isValidUsername(sanitizedUsername)) {
      toast.error("El nombre de usuario contiene caracteres inválidos.");
      return;
    }

    if (!isValidPassword(sanitizedPassword)) {
      toast.error("La contraseña no cumple con los requisitos de seguridad.");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', {
        username: sanitizedUsername,
        password: sanitizedPassword
      });

      if (response && response.accessToken) {
        sessionStorage.setItem('token', response.accessToken);
        setFormData({ username: '', password: '' }); 
        toast.success("Inicio de sesión exitoso");
        onLoginSuccess();
      }

    } catch (errString) {
      toast.error(errString);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '400px', margin: '40px auto', padding: '30px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }} className="text-gradient">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="username">Nombre de Usuario:</label>
          <input 
            type="text" 
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
            maxLength="20"
            autoComplete="off"
          />
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label htmlFor="password">Contraseña:</label>
          <input 
            type="password" 
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            maxLength="50"
            autoComplete="new-password"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary"
          style={{ marginBottom: '15px' }}
        >
          {loading ? 'Verificando...' : 'Acceder'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', fontSize: '0.9rem', margin: 0 }}>
        ¿No tienes cuenta?{' '}
        <span 
          onClick={onSwitchToRegister} 
          style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 'bold' }}
        >
          Regístrate aquí
        </span>
      </p>
    </div>
  );
}
