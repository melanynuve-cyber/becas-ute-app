// src/lib/utils.js

// Formatea una fecha ISO a texto legible local
export function formatFecha(iso) {
  const opciones = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }

  return new Date(iso).toLocaleDateString(
    'es-MX', 
    opciones
  )
}

// Devuelve la clase CSS del badge para un estado de solicitud o reporte
export function estadoBadgeClass(estado) {
  const map = {
    pendiente: 'badge-pendiente',
    en_revision: 'badge-en_revision',
    aprobada: 'badge-aprobada',
    rechazada: 'badge-rechazada'
  }

  const estadoLimpio = estado?.toLowerCase()
  const claseMapeada = map[estadoLimpio] ?? ''

  return `badge ${claseMapeada}`
}

// Devuelve la etiqueta de texto en español para un estado administrativo
export function estadoLabel(estado) {
  const map = {
    pendiente: 'Pendiente',
    en_revision: 'En revisión',
    aprobada: 'Aprobada',
    rechazada: 'Rechazada'
  }

  const estadoLimpio = estado?.toLowerCase()
  const etiquetaMapeada = map[estadoLimpio]

  return etiquetaMapeada ?? estado ?? '—'
}