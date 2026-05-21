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

// Validador local extraído de la versión de Claude
  export function validarFilasCSV(texto) {
    const lineas = texto.trim().split('\n')
    if (lineas.length < 2) return { validas: [], errores: [{ fila: 0, razon: 'El archivo no contiene datos.' }] }

    const encabezado = lineas[0].toLowerCase().replace(/\r/, '')
    if (!encabezado.includes('matricula') || !encabezado.includes('nombre')) {
      return { validas: [], errores: [{ fila: 1, razon: 'Faltan columnas "matricula" y "nombre".' }] }
    }

    const validas = []
    const errores = []

    for (let i = 1; i < lineas.length; i++) {
      const fila = lineas[i].replace(/\r/, '').trim()
      if (!fila) continue

      const cols = fila.split(',')
      const matricula = (cols[0] || '').trim()
      const nombre = cols.slice(1).join(',').trim()

      if (!matricula && !nombre) continue

      const numFila = i + 1

      if (!/^\d+$/.test(matricula)) {
        errores.push({ fila: numFila, matricula, razon: 'Matrícula no numérica.' })
        continue
      }
      if (matricula.length !== 9) {
        errores.push({ fila: numFila, matricula, razon: 'Longitud inválida (deben ser 9).' })
        continue
      }
      if (!nombre) {
        errores.push({ fila: numFila, matricula, razon: 'Nombre vacío.' })
        continue
      }

      validas.push({ matricula, nombre })
    }

    return { validas, errores }
  }