import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { sanitizeInput, isValidTextDescription, isStrictBoolean, isValidName, isValidUsername, isValidPassword } from '../utils/security';
import api from '../utils/api';

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('tasks');

  const [tasks, setTasks] = useState([]);
  const [taskFormData, setTaskFormData] = useState({ id: null, name: '', description: '', priority: false });
  
  const [users, setUsers] = useState([]);
  const [userFormData, setUserFormData] = useState({ id: null, name: '', lastname: '', username: '', password: '' });

  const [loading, setLoading] = useState(false);

  // Decodificar Token para determinar rol_id localmente
  const token = sessionStorage.getItem('token');
  let isAdmin = false;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      isAdmin = payload.rol_id === 1;
    } catch(e) {}
  }

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/api/task');
      setTasks(Array.isArray(res) ? res : []); 
    } catch (err) {
      toast.error(err);
      if (err.includes("Acceso denegado")) onLogout();
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/user');
      setUsers(Array.isArray(res) ? res : []); 
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    const sanName = sanitizeInput(taskFormData.name);
    const sanDesc = sanitizeInput(taskFormData.description);

    if (!isValidTextDescription(sanName) || !isValidTextDescription(sanDesc)) {
       toast.error("El texto introducido no es válido o es muy largo.");
       return;
    }
    if (!isStrictBoolean(taskFormData.priority)) {
      toast.error("Error en inferencia de tipos de datos.");
      return;
    }

    setLoading(true);
    try {
      if (taskFormData.id) {
        await api.put(`/api/task/${taskFormData.id}`, { name: sanName, description: sanDesc, priority: taskFormData.priority });
        toast.success("Tarea actualizada correctamente.");
      } else {
        await api.post('/api/task', { name: sanName, description: sanDesc, priority: taskFormData.priority });
        toast.success("Tarea registrada correctamente.");
      }
      setTaskFormData({ id: null, name: '', description: '', priority: false });
      fetchTasks();
    } catch (errMessage) {
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (t) => {
    setTaskFormData({ id: t.id, name: t.name, description: t.description, priority: t.priority });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta tarea?")) return;
    try {
      await api.delete(`/api/task/${id}`);
      toast.success("Tarea eliminada.");
      fetchTasks();
    } catch (err) {
      toast.error(err);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const sanName = sanitizeInput(userFormData.name);
    const sanLastname = sanitizeInput(userFormData.lastname);
    const sanUsername = sanitizeInput(userFormData.username);
    const password = userFormData.password;

    if (!isValidName(sanName) || !isValidName(sanLastname)) {
      toast.error("Nombre y apellidos inválidos.");
      return;
    }
    if (!isValidUsername(sanUsername)) {
      toast.error("Nombre de usuario inválido.");
      return;
    }

    if (!userFormData.id || password.length > 0) {
      if (!isValidPassword(password)) {
        toast.error("La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.");
        return;
      }
    }

    setLoading(true);
    try {
      if (userFormData.id) {
        const payload = { name: sanName, lastname: sanLastname, username: sanUsername };
        if (password) payload.password = password;
        
        await api.patch(`/api/user/${userFormData.id}`, payload);
        toast.success("Usuario actualizado.");
      } else {
        await api.post('/api/user', { name: sanName, lastname: sanLastname, username: sanUsername, password: password });
        toast.success("Usuario registrado.");
      }
      setUserFormData({ id: null, name: '', lastname: '', username: '', password: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (u) => {
    setUserFormData({ id: u.id, name: u.name, lastname: u.lastname, username: u.username, password: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario? (Asegúrate de que no tenga tareas)")) return;
    try {
      await api.delete(`/api/user/${id}`);
      toast.success("Usuario eliminado.");
      fetchUsers();
    } catch (err) {
      toast.error(err);
    }
  };


  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', width: '100%', alignSelf: 'flex-start' }}>
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }} className="text-gradient">Panel de Control</h2>
        <button 
          onClick={() => {
            sessionStorage.removeItem('token');
            onLogout();
          }}
          className="btn-danger"
          style={{ width: 'auto' }}
        >
          Cerrar Sesión 
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          className={activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'}
          style={{ flex: 1, padding: '12px' }}
          onClick={() => setActiveTab('tasks')}
        >
          Gestión de Tareas
        </button>
        <button 
          className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
          style={{ flex: 1, padding: '12px' }}
          onClick={() => setActiveTab('users')}
        >
          Gestión de Usuarios
        </button>
      </div>

      {activeTab === 'tasks' && (
        <>
          <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>{taskFormData.id ? 'Editar Tarea' : 'Registrar Nueva Tarea'}</h3>
            <form onSubmit={handleTaskSubmit} autoComplete="off">
              <div style={{ marginBottom: '15px' }}>
                <label>Nombre de la Tarea:</label>
                <input 
                  type="text" 
                  value={taskFormData.name}
                  onChange={(e) => setTaskFormData({...taskFormData, name: e.target.value})}
                  required
                  maxLength="150"
                  style={{ borderColor: (taskFormData.name && !isValidTextDescription(taskFormData.name)) ? 'var(--error)' : 'var(--border-color)' }}
                />
                {(taskFormData.name && !isValidTextDescription(taskFormData.name)) && (
                  <small style={{ color: 'var(--error)' }}>Solo se permiten letras, números, espacios y los signos de puntuación básicos.</small>
                )}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Descripción:</label>
                <textarea 
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({...taskFormData, description: e.target.value})}
                  required
                  maxLength="200"
                  rows={3}
                  style={{ borderColor: (taskFormData.description && !isValidTextDescription(taskFormData.description)) ? 'var(--error)' : 'var(--border-color)' }}
                />
                {(taskFormData.description && !isValidTextDescription(taskFormData.description)) && (
                  <small style={{ color: 'var(--error)' }}>La descripción contiene caracteres no permitidos.</small>
                )}
              </div>
              <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={taskFormData.priority}
                    onChange={(e) => setTaskFormData({...taskFormData, priority: e.target.checked})}
                    style={{ marginRight: '10px', width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Marcar como Prioridad Alta</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                  {loading ? 'Guardando...' : (taskFormData.id ? 'Actualizar Tarea' : 'Guardar Tarea')}
                </button>
                {taskFormData.id && (
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setTaskFormData({ id: null, name: '', description: '', priority: false })}>
                    Cancelar
                  </button>
                )}
              </div>
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
                   justifyContent: 'space-between',
                   alignItems: 'center'
                 }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <strong style={{ fontSize: '1.1rem' }}>{t.name}</strong> 
                       {t.priority && <span style={{ 
                         background: 'var(--error)', 
                         color: '#fff', 
                         padding: '2px 8px', 
                         borderRadius: '12px',
                         fontSize: '0.75rem',
                         fontWeight: 'bold'
                       }}>PRIORITARIO</span>}
                     </div>
                     <p style={{ margin: 0, color: 'var(--text-muted)' }}>{t.description}</p>
                   </div>
                   <div style={{ display: 'flex', gap: '10px' }}>
                     <button className="btn-warning" style={{ width: 'auto' }} onClick={() => handleEditTask(t)}>Editar</button>
                     <button className="btn-danger" style={{ width: 'auto' }} onClick={() => handleDeleteTask(t.id)}>Eliminar</button>
                   </div>
                 </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <>
          <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>{userFormData.id ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</h3>
            <form onSubmit={handleUserSubmit} autoComplete="off">
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label>Nombre(s):</label>
                  <input type="text" value={userFormData.name} onChange={(e) => setUserFormData({...userFormData, name: e.target.value})} required maxLength="100" style={{ borderColor: (userFormData.name && !isValidName(userFormData.name)) ? 'var(--error)' : 'var(--border-color)' }} />
                  {(userFormData.name && !isValidName(userFormData.name)) && (
                    <small style={{ color: 'var(--error)', display: 'block', marginTop: '5px' }}>Letras y espacios únicamente (min 2).</small>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label>Apellidos:</label>
                  <input type="text" value={userFormData.lastname} onChange={(e) => setUserFormData({...userFormData, lastname: e.target.value})} required maxLength="100" style={{ borderColor: (userFormData.lastname && !isValidName(userFormData.lastname)) ? 'var(--error)' : 'var(--border-color)' }} />
                  {(userFormData.lastname && !isValidName(userFormData.lastname)) && (
                    <small style={{ color: 'var(--error)', display: 'block', marginTop: '5px' }}>Letras y espacios únicamente (min 2).</small>
                  )}
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Nombre de Usuario:</label>
                <input type="text" value={userFormData.username} onChange={(e) => setUserFormData({...userFormData, username: e.target.value})} required maxLength="20" style={{ borderColor: (userFormData.username && !isValidUsername(userFormData.username)) ? 'var(--error)' : 'var(--border-color)' }} />
                {(userFormData.username && !isValidUsername(userFormData.username)) && (
                    <small style={{ color: 'var(--error)' }}>Solo alfanuméricos y guiones bajos (3-20 caracteres).</small>
                )}
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label>Contraseña {userFormData.id && '(Dejar en blanco para no cambiar)'}:</label>
                <input type="password" value={userFormData.password} onChange={(e) => setUserFormData({...userFormData, password: e.target.value})} required={!userFormData.id} maxLength="50" autoComplete="new-password" style={{ borderColor: (userFormData.password && !isValidPassword(userFormData.password)) ? 'var(--error)' : 'var(--border-color)' }} />
                {(userFormData.password && !isValidPassword(userFormData.password)) && (
                    <small style={{ color: 'var(--error)' }}>Debe tener al menos 8 caracteres, 1 mayús, 1 minús, 1 número y 1 símbolo.</small>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                  {loading ? 'Guardando...' : (userFormData.id ? 'Actualizar Usuario' : 'Guardar Usuario')}
                </button>
                {userFormData.id && (
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setUserFormData({ id: null, name: '', lastname: '', username: '', password: '' })}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>Lista de Usuarios</h3>
            {users.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No hay usuarios adicionales registrados.</p> : null}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {users.map(u => (
                 <li key={u.id} style={{ 
                   borderBottom: '1px solid var(--border-color)', 
                   padding: '15px 0',
                   display: 'flex',
                   justifyContent: 'space-between',
                   alignItems: 'center'
                 }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                     <strong style={{ fontSize: '1.1rem' }}>{u.username}</strong> 
                     <p style={{ margin: 0, color: 'var(--text-muted)' }}>{u.name} {u.lastname}</p>
                     <small style={{ color: 'var(--text-muted)' }}>Creado: {new Date(u.created_at).toLocaleDateString()}</small>
                   </div>
                   <div style={{ display: 'flex', gap: '10px' }}>
                     {isAdmin ? (
                       <>
                         <button className="btn-warning" style={{ width: 'auto' }} onClick={() => handleEditUser(u)}>Editar</button>
                         <button className="btn-danger" style={{ width: 'auto' }} onClick={() => handleDeleteUser(u.id)}>Eliminar</button>
                       </>
                     ) : (
                       <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>Sin permisos de edición</span>
                     )}
                   </div>
                 </li>
              ))}
            </ul>
          </div>
        </>
      )}

    </div>
  );
}
