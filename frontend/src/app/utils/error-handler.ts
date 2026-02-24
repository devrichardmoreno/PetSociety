/**
 * Utilidad para manejar errores del backend y convertirlos en mensajes amigables para el usuario
 */

export interface ApiError {
  error?: any;
  status?: number;
  statusText?: string;
  message?: string;
}

/**
 * Convierte errores del backend en mensajes amigables en español
 * @param error - El error recibido del backend
 * @returns Mensaje de error amigable para el usuario
 */
export function getFriendlyErrorMessage(error: ApiError): string {
  // Si no hay error, retornar mensaje genérico
  if (!error) {
    return 'Ocurrió un error inesperado. Por favor, intentá nuevamente.';
  }

  // Extraer el objeto error si existe (PRIORIDAD: revisar primero el error del backend)
  const errorData = error.error;
  const status = error.status;

  // Si errorData es un objeto (ProblemDetail del backend)
  if (errorData && typeof errorData === 'object') {
    // Prioridad 1: detail (mensaje principal del error)
    const detail = errorData.detail || errorData.message || '';
    if (detail && detail.trim() !== '') {
      const translated = translateErrorMessage(detail, status);
      // Si el mensaje traducido es específico o el original ya está en español, usarlo
      if (translated.includes('último administrador') || 
          translated.includes('debe quedar') ||
          detail.includes('último administrador') ||
          detail.includes('debe quedar')) {
        return translated;
      }
      // Si el mensaje original ya está en español y es claro, usarlo directamente
      if (detail.length < 200 && 
          !detail.includes('http://') && 
          !detail.includes('localhost') &&
          (detail.includes('último') || detail.includes('administrador') || detail.includes('debe quedar'))) {
        return detail;
      }
      return translated;
    }
    
    // Prioridad 2: title (si no hay detail)
    const title = errorData.title || '';
    if (title && title.trim() !== '') {
      return translateErrorTitle(title, status);
    }
  }

  // Si errorData es un string
  if (typeof errorData === 'string' && errorData.trim() !== '') {
    return translateErrorMessage(errorData, status);
  }

  // Manejar errores de conexión SOLO si no hay errorData del backend
  if (error.message && error.message.includes('Http failure') && !errorData) {
    return 'No se pudo conectar con el servidor. Verificá tu conexión a internet.';
  }

  // Manejar por código de estado HTTP
  if (status) {
    return getMessageByStatus(status);
  }

  // Fallback final
  return 'Ocurrió un error inesperado. Por favor, intentá nuevamente.';
}

/**
 * Indica si el error corresponde a "email no verificado" (403)
 */
export function isEmailNotVerifiedError(error: ApiError): boolean {
  if (!error || error.status !== 403) return false;
  const errorData = error.error;
  if (errorData && typeof errorData === 'object') {
    const title = (errorData.title || '').toLowerCase();
    const detail = (errorData.detail || '').toLowerCase();
    return title.includes('email not verified') || (detail.includes('email') && detail.includes('verific'));
  }
  return false;
}

/**
 * Traduce mensajes de error técnicos a mensajes amigables
 */
function translateErrorMessage(detail: string, status?: number): string {
  const detailLower = detail.toLowerCase();

  // Errores de diagnóstico (409) - PRIORIDAD ALTA
  if (status === 409 && (
    detailLower.includes('no se puede crear un diagnóstico') ||
    detailLower.includes('diagnóstico') && (detailLower.includes('antes') || detailLower.includes('después') || detailLower.includes('hora'))
  )) {
    // Si el mensaje ya está en español y es claro, devolverlo tal cual
    if (detailLower.includes('no se puede crear un diagnóstico antes de que comience la cita')) {
      return 'No se puede crear un diagnóstico antes de que comience la cita.';
    }
    if (detailLower.includes('no se puede crear un diagnóstico después de 1 hora')) {
      return 'No se puede crear un diagnóstico después de 1 hora de haber terminado la cita.';
    }
    // Fallback genérico
    return detail; // Devolver el mensaje original del backend si es claro
  }

  // Errores de último administrador (409) - PRIORIDAD ALTA
  if (status === 409 && (
    detailLower.includes('último administrador') || 
    detailLower.includes('last admin') ||
    detailLower.includes('debe quedar al menos un administrador') ||
    detailLower.includes('no se puede dar de baja')
  )) {
    return 'No se puede dar de baja al último administrador activo. Debe quedar al menos un administrador en el sistema.';
  }

  // Errores de duplicados (409)
  if (status === 409 || detailLower.includes('duplicate') || detailLower.includes('already exists')) {
    if (detailLower.includes('username')) {
      return 'El nombre de usuario ya existe. Por favor, elegí otro.';
    }
    if (detailLower.includes('email')) {
      return 'El email ya está registrado. Por favor, usá otro email.';
    }
    if (detailLower.includes('dni')) {
      return 'El DNI ya está registrado. Por favor, verificá los datos ingresados.';
    }
    return 'Esta información ya está registrada en el sistema. Por favor, verificá los datos ingresados.';
  }

  // Errores de validación (400)

  if (status === 401 || detailLower.includes('authentication') || detailLower.includes('unauthorized')) {
    return 'Usuario o contraseña incorrectos.';
  }

  if (status === 400 || detailLower.includes('invalid') || detailLower.includes('validation')) {
    if (detailLower.includes('name')) {
      return 'El nombre ingresado no es valido.';
    }
    if (detailLower.includes('surname')) {
      return 'El apellido ingresado no es válido.';
    }
    if (detailLower.includes('phone')) {
      return 'El teléfono ingresado no es válido.';
    }
    if (detailLower.includes('dni')) {
      return 'El DNI ingresado no es válido.';
    }
    if (detailLower.includes('email')) {
      return 'El email ingresado no es válido.';
    }
    if (detailLower.includes('password')) {
      return 'La contraseña no cumple con los requisitos.';
    }
    return 'Los datos ingresados no son válidos. Por favor, verificá todos los campos.';
  }

  // Errores de autenticación (401)
 

  // Errores de permisos (403) - Email no verificado: mostrar mensaje del backend
  if (status === 403) {
    if (detailLower.includes('email') && detailLower.includes('verific')) {
      return detail || 'Tu email no ha sido verificado. Verificá tu bandeja de entrada o corregí tu email si te equivocaste.';
    }
    return 'No tenés permisos para realizar esta acción.';
  }
  if (detailLower.includes('forbidden') || detailLower.includes('access denied')) {
    return 'No tenés permisos para realizar esta acción.';
  }

  // Errores de no encontrado (404)
  if (status === 404 || detailLower.includes('not found')) {
    return 'No se encontró la información solicitada.';
  }

  // Errores del servidor (500)
  if (status === 500 || detailLower.includes('internal server error')) {
    return 'Ocurrió un error en el servidor. Por favor, intentá nuevamente más tarde.';
  }

  // Si el mensaje ya está en español y es amigable, retornarlo tal cual
  // Esto captura mensajes del backend que ya están en español
  if (!detailLower.includes('http://') && 
      !detailLower.includes('localhost') &&
      !detailLower.includes('timestamp') &&
      !detailLower.includes('instance') &&
      !detailLower.includes('type') &&
      !detailLower.includes('problemdetail') &&
      detail.length < 200 &&
      (detail.includes('último') || detail.includes('administrador') || detail.includes('debe quedar'))) {
    return detail;
  }

  // Mensaje genérico si no se puede traducir
  return 'Ocurrió un error al procesar la solicitud. Por favor, intentá nuevamente.';
}

/**
 * Traduce títulos de error técnicos a mensajes amigables
 */
function translateErrorTitle(title: string, status?: number): string {
  const titleLower = title.toLowerCase();

  // Errores de último administrador (409) - PRIORIDAD ALTA
  if (status === 409 && (
    titleLower.includes('last admin') ||
    titleLower.includes('último administrador')
  )) {
    return 'No se puede dar de baja al último administrador activo. Debe quedar al menos un administrador en el sistema.';
  }

  if (titleLower.includes('data integrity violation')) {
    return 'Esta información ya está registrada en el sistema.';
  }
  if (titleLower.includes('user exists')) {
    return 'El usuario ya existe.';
  }
  if (titleLower.includes('invalid')) {
    return 'Los datos ingresados no son válidos.';
  }
  if (titleLower.includes('authentication failed')) {
    return 'Usuario o contraseña incorrectos.';
  }
  if (titleLower.includes('not found')) {
    return 'No se encontró la información solicitada.';
  }

  return 'Ocurrió un error al procesar la solicitud.';
}

/**
 * Retorna mensajes amigables según el código de estado HTTP
 */
function getMessageByStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Los datos ingresados no son válidos. Por favor, verificá todos los campos.';
    case 401:
      return 'Tu sesión expiró. Por favor, iniciá sesión nuevamente.';
    case 403:
      return 'No tenés permisos para realizar esta acción.';
    case 404:
      return 'No se encontró la información solicitada.';
    case 409:
      return 'Esta información ya está registrada en el sistema. Por favor, verificá los datos ingresados.';
    case 500:
      return 'Ocurrió un error en el servidor. Por favor, intentá nuevamente más tarde.';
    default:
      return 'Ocurrió un error inesperado. Por favor, intentá nuevamente.';
  }
}
