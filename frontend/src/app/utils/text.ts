/**
 * Utilidades para manipulación y formateo de texto
 */

/**
 * Capitaliza la primera letra de cada palabra y el resto en minúsculas
 * Ejemplo: "juan pérez" -> "Juan Pérez"
 */
export function capitalizeName(name: string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Capitaliza nombres propios (nombre y apellido)
 */
export function capitalizeProperNames(name: string, surname: string): { name: string, surname: string } {
  return {
    name: capitalizeName(name),
    surname: capitalizeName(surname)
  };
}

