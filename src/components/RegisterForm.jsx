import { useState } from 'react';
import toast from 'react-hot-toast';
import { sanitizeInput, isValidUsername, isValidPassword, isValidName } from '../utils/security';
import api from '../utils/api';

export default function RegisterForm({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const sanitizedName = sanitizeInput(formData.name);
    const sanitizedLastname = sanitizeInput(formData.lastname);
    const sanitizedUsername = sanitizeInput(formData.username);
    const password = formData.password; 

    if (!isValidName(sanitizedName) || !isValidName(sanitizedLastname)) {
      toast.error("El nombre y apellidos solo pueden contener letras y espacios.");
      return;
    }

    if (!isValidUsername(sanitizedUsername)) {
      toast.error("El nombre de usuario contiene caracteres inválidos.");
      return;
    }

    if (!isValidPassword(password)) {
      toast.error("La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      await api.post('/api/auth/register', {
        name: sanitizedName,
        lastname: sanitizedLastname,
        username: sanitizedUsername,
        password: password
      });

      toast.success("Registro exitoso. Ahora puedes iniciar sesión.");
      setFormData({ name: '', lastname: '', username: '', password: '' });
      onSwitchToLogin();

    } catch (errMessage) {
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '400px', margin: '40px auto', padding: '30px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }} className="text-gradient">Registrar Cuenta</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name">Nombre(s):</label>
          <input 
            type="text" 
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            maxLength="50"
            autoComplete="off"
            style={{ borderColor: (formData.name && !isValidName(formData.name)) ? 'var(--error)' : 'var(--border-color)' }}
          />
          {(formData.name && !isValidName(formData.name)) && (
            <small style={{ color: 'var(--error)' }}>Letras y espacios únicamente (min 2).</small>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="lastname">Apellidos:</label>
          <input 
            type="text" 
            id="lastname"
            value={formData.lastname}
            onChange={(e) => setFormData({...formData, lastname: e.target.value})}
            required
            maxLength="50"
            autoComplete="off"
            style={{ borderColor: (formData.lastname && !isValidName(formData.lastname)) ? 'var(--error)' : 'var(--border-color)' }}
          />
          {(formData.lastname && !isValidName(formData.lastname)) && (
            <small style={{ color: 'var(--error)' }}>Letras y espacios únicamente (min 2).</small>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="username">Nombre de Usuario:</label>
          <input 
            type="text" 
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
            maxLength="15"
            autoComplete="off"
            style={{ borderColor: (formData.username && !isValidUsername(formData.username)) ? 'var(--error)' : 'var(--border-color)' }}
          />
          {(formData.username && !isValidUsername(formData.username)) && (
              <small style={{ color: 'var(--error)' }}>Solo alfanuméricos y guiones bajos (3-15 caracteres).</small>
          )}
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label htmlFor="password">Contraseña Segura:</label>
          <input 
            type="password" 
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            maxLength="50"
            autoComplete="new-password"
            style={{ borderColor: (formData.password && !isValidPassword(formData.password)) ? 'var(--error)' : 'var(--border-color)' }}
          />
          {(formData.password && !isValidPassword(formData.password)) && (
              <small style={{ color: 'var(--error)' }}>Debe tener al menos 8 caracteres, 1 mayús, 1 minús, 1 número y 1 símbolo.</small>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary"
          style={{ marginBottom: '15px' }}
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', fontSize: '0.9rem', margin: 0 }}>
        ¿Ya tienes cuenta?{' '}
        <span 
          onClick={onSwitchToLogin} 
          style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 'bold' }}
        >
          Inicia Sesión
        </span>
      </p>
    </div>
  );
}
