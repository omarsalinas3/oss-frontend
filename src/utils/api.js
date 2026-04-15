import axios from 'axios';

// Configurando la instancia de Axios
const api = axios.create({
  baseURL: 'http://localhost:3000', // Asumiendo que esta es la ruta por defecto del Back
  timeout: 10000, // Timeout seguro para evitar ataques de agotamiento de recursos (DoS)
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor de peticiones para inyectar token de forma segura
api.interceptors.request.use(
  (config) => {
    // Seguridad por Defecto: Usar sessionStorage en lugar de localStorage para el token, 
    // de manera que la sesión se invalide naturalmente al cerrar el navegador.
    const token = sessionStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Suprimir cabeceras no necesarias y ocultar información del agente/version que a veces axios auto-incluye
    delete config.headers['X-Powered-By'];

    return config;
  },
  (error) => {
    // Los errores de peticion no se devuelven desnudos
    console.error("Error intero configurando petición."); 
    return Promise.reject(new Error("Ocurrió un error al preparar la solicitud."));
  }
);

// Interceptor de respuestas para Manejo de Errores y Logs Seguros
// "Se registran los fallos, pero no se explican a usuarios desconocidos."
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es correcta, solo retornamos los datos
    return response.data;
  },
  (error) => {
    // Registro real del error en consola (Para el desarrollador / logs de depuración)
    // En producción idealmente esto iría a un log server externo, omitiendo data sensible
    if (error.response) {
      console.warn(`[LOG] HTTP Error ${error.response.status}: ${error.response.config.url}`);
    } else {
      console.warn(`[LOG] Network/Timeout error: ${error.message}`);
    }

    // Respuesta genérica hacia el frontend o el usuario: "Control de salidas"
    // No revelamos el error de base de datos ni stacktrace
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

    // Rechazamos la promesa devolviendo SOLO la cadena genérica controlada
    return Promise.reject(mensajeGenerico);
  }
);

export default api;
