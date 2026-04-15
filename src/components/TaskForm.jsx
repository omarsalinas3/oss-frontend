import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { sanitizeInput, isValidTextDescription, isStrictBoolean } from '../utils/security';
import api from '../utils/api';

export default function TaskForm({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/api/task');
      setTasks(Array.isArray(res) ? res : []); 
    } catch (err) {
      toast.error(err);
      if (err.includes("Acceso denegado")) {
        onLogout();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const sanName = sanitizeInput(formData.name);
    const sanDesc = sanitizeInput(formData.description);

    if (!isValidTextDescription(sanName) || !isValidTextDescription(sanDesc)) {
       toast.error("El texto introducido no es válido o es muy largo.");
       return;
    }

    if (!isStrictBoolean(formData.priority)) {
      toast.error("Error en inferencia de tipos de datos.");
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/task', {
        name: sanName,
        description: sanDesc,
        priority: formData.priority
      });
      toast.success("Tarea registrada correctamente.");
      setFormData({ name: '', description: '', priority: false });
      fetchTasks();
    } catch (errMessage) {
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto' }}>
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }} className="text-gradient">Panel de Tareas</h2>
        <button 
          onClick={() => {
            sessionStorage.removeItem('token');
            onLogout();
          }}
          className="btn-danger"
          style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Cerrar Sesión 
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>Registrar Nueva Tarea</h3>
        <form onSubmit={handleSubmit} autoComplete="off">
          
          <div style={{ marginBottom: '15px' }}>
            <label>Nombre de la Tarea:</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              maxLength="150"
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Descripción:</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              maxLength="200"
              rows={3}
            />
          </div>

          <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0 }}>
              <input 
                type="checkbox" 
                checked={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.checked})}
                style={{ marginRight: '10px', width: '20px', height: '20px', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Marcar como Prioridad Alta</span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Guardando...' : 'Guardar Tarea'}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>Lista de Tareas</h3>
        {tasks.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No hay tareas registradas.</p> : null}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {tasks.map(t => (
             <li key={t.id} style={{ 
               borderBottom: '1px solid var(--border-color)', 
               padding: '15px 0',
               display: 'flex',
               flexDirection: 'column',
               gap: '5px'
             }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <strong style={{ fontSize: '1.1rem' }}>{t.name}</strong> 
                 {t.priority && <span style={{ 
                   background: 'rgba(239, 68, 68, 0.2)', 
                   color: 'var(--error)', 
                   padding: '2px 8px', 
                   borderRadius: '12px',
                   fontSize: '0.75rem',
                   fontWeight: 'bold'
                 }}>PRIORITARIO</span>}
               </div>
               <p style={{ margin: 0, color: 'var(--text-muted)' }}>{t.description}</p>
             </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
