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

    console.error("Error intero configurando petición."); 
    return Promise.reject(new Error("Ocurrió un error al preparar la solicitud."));
  }
);
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      console.warn(`[LOG] HTTP Error ${error.response.status}: ${error.response.config.url}`);
    } else {
      console.warn(`[LOG] Network/Timeout error: ${error.message}`);
    }

    let mensajeGenerico = "Ha ocurrido un error inesperado al conectar con el servidor.";

    if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
            mensajeGenerico = "Acceso denegado o credenciales inválidas.";
        } else if (error.response.status === 400) {
            mensajeGenerico = "Los datos proporcionados no son válidos.";
        } else if (error.response.status === 404) {
            mensajeGenerico = "No se encontró el recurso solicitado.";
        } else {
            mensajeGenerico = "Error interno del servidor. Por favor, intente más tarde.";
        }
    }

    return Promise.reject(mensajeGenerico);
  }
);

export default api;
