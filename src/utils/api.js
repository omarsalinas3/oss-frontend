import axios from 'axios';

// Configurando la instancia de Axios
const api = axios.create({
  baseURL: 'http://localhost:3000', 
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor de peticiones para inyectar token de forma segura
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    delete config.headers['X-Powered-By'];

    return config;
  },
  (error) => {
    return Promise.reject(new Error("Ocurrió un error al preparar la solicitud."));
  }
);
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    let mensajeGenerico = "Ha ocurrido un error inesperado al conectar con el servidor.";

    if (error.response) {
        if (originalRequest.url === '/api/auth/login') {
            return Promise.reject(error.response.data?.error || "Credenciales incorrectas");
        }

        // 401 = Token vencido, intentar refresco
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = sessionStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error("No refresh token");

                const res = await axios.post('http://localhost:3000/api/auth/refresh', { refreshToken });
                if (res.data.accessToken) {
                    sessionStorage.setItem('token', res.data.accessToken);
                    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                mensajeGenerico = "Sesión expirada. Redirigiendo...";
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('refreshToken');
                sessionStorage.removeItem('user');
                setTimeout(() => {
                    window.location.href = '/'; 
                }, 1500);
            }
        } 
        // 403 = Falta de permisos (RBAC)
        else if (error.response.status === 403) {
            mensajeGenerico = "No tienes los permisos de Administrador para realizar esta acción.";
        } else if (error.response.status === 400) {
            mensajeGenerico = "Los datos proporcionados no son válidos.";
        } else if (error.response.status === 404) {
            mensajeGenerico = "No se encontró el recurso solicitado.";
        } else if (error.response.status !== 401) {
            mensajeGenerico = "Error interno del servidor. Por favor, intente más tarde.";
        }
    }

    return Promise.reject(mensajeGenerico);
  }
);

export default api;
