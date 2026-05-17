// src/lib/utils.js

// Formatea una fecha ISO a texto legible
export function formatFecha(iso) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Devuelve la clase CSS del badge para un estado de solicitud o reporte
export function estadoBadgeClass(estado) {
  const map = {
    pendiente:   'badge-pendiente',
    en_revision: 'badge-en_revision',
    aprobada:    'badge-aprobada',
    rechazada:   'badge-rechazada',
  }
  return `badge ${map[estado?.toLowerCase()] ?? ''}`
}

// Devuelve la etiqueta de texto en español para un estado
export function estadoLabel(estado) {
  const map = {
    pendiente:   'Pendiente',
    en_revision: 'En revisión',
    aprobada:    'Aprobada',
    rechazada:   'Rechazada',
  }
  return map[estado?.toLowerCase()] ?? estado ?? '—'
}