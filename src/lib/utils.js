/**
 * src/lib/utils.js
 * Utilidades compartidas entre todos los componentes.
 * Importar con: import { formatFecha, estadoBadgeClass, estadoLabel } from '../../lib/utils.js'
 */

/**
 * Formatea una fecha ISO a texto legible en español (México).
 * @param {string} iso  — cadena ISO 8601, ej. "2025-03-01T00:00:00Z"
 * @returns {string}    — ej. "1 mar 2025"
 */
export function formatFecha(iso) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Devuelve la clase CSS del badge para un estado de solicitud/reporte.
 * Las clases base están definidas en App.svelte como :global(.badge-*).
 * @param {string} estado  — valor tal como viene del backend, ej. "En_revision"
 * @returns {string}       — ej. "badge badge-en_revision"
 */
export function estadoBadgeClass(estado) {
  const map = {
    pendiente:   'badge-pendiente',
    en_revision: 'badge-en_revision',
    aprobada:    'badge-aprobada',
    rechazada:   'badge-rechazada',
  }
  return `badge ${map[estado?.toLowerCase()] ?? ''}`
}

/**
 * Devuelve la etiqueta legible para un estado.
 * @param {string} estado  — valor tal como viene del backend
 * @returns {string}       — ej. "En revisión"
 */
export function estadoLabel(estado) {
  const map = {
    pendiente:   'Pendiente',
    en_revision: 'En revisión',
    aprobada:    'Aprobada',
    rechazada:   'Rechazada',
  }
  return map[estado?.toLowerCase()] ?? estado ?? '—'
}