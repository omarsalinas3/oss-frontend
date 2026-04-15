import DOMPurify from 'dompurify';

/**
 * Utilidades de Seguridad (Validación de Entradas y Control de Salidas)
 */

// Sanitizar Strings para evitar XSS si en algún momento se renderizan de forma peligrosa o se envían a APIs sensibles
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input.trim());
};

// Validación de Nombres de Usuario
// Solo alfanuméricos y guiones bajos (min 3, max 20)
export const isValidUsername = (username) => {
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
};

// Validación de Contraseñas Seguras
// Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial !@#$%^&*
export const isValidPassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~-]).{8,50}$/;
  return regex.test(password);
};

// Validación para Nombres Reales Evitando Caracteres Especiales extraños (para nombre y apellido)
// Permite letras, espacios y acentos, min 2 max 100
export const isValidName = (name) => {
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,100}$/;
  return regex.test(name);
};

// Validación para Tareas/Textos Genéricos (Whitelist)
// Limita la entrada a solo texto alfanumérico y puntuación básica para la descripción
export const isValidTextDescription = (text) => {
  if (text.length > 200) return false; // Limite según base de datos (VarChar 200)
  // Permitimos letras, números, espacios y signos básicos de puntuación
  const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,;:\-!?()]+$/;
  return regex.test(text);
};

// Validación de booleanos asegurando el tipado estricto
export const isStrictBoolean = (value) => {
  return typeof value === 'boolean';
};
