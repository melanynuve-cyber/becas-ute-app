// src/lib/services/api.js
import { get } from 'svelte/store'
import { token, logout } from '../stores/auth.js'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// impide que multiples 401 en paralelo disparen redirects redundantes
let _redirigiendo = false

// Manejador centralizado de peticiones HTTP
// asBlob: true para respuestas binarias (CSV, ZIP, PDF)
async function request(method, path, body = null, opts = {}) {
  const { isMultipart = false, asBlob = false } = opts
  const headers = {}
  const jwt = get(token)

  if (jwt) headers['Authorization'] = `Bearer ${jwt}`
  if (!isMultipart && body) headers['Content-Type'] = 'application/json'

  const requestBody = isMultipart ? body : body ? JSON.stringify(body) : null

  const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: requestBody })

  // Interceptor para vencimiento de sesión (Excluye el login)
  if (res.status === 401 && path !== '/auth/login') {
    if (!_redirigiendo) {
      _redirigiendo = true
      logout()
      window.location.href = '/login'
    }
    throw new Error('Sesión expirada. Redirigiendo al login.')
  }

  if (asBlob) {
    if (!res.ok) throw new Error('Error al descargar el archivo')
    return await res.blob()
  }

  const data = await res.json().catch(() => ({}))

  // Manejo de excepciones y parseo de errores multiplexados del backend
  if (!res.ok) {
    const msg = data?.detail || 'Error en el servidor'
    if (Array.isArray(msg)) throw new Error(msg.map(e => e.msg).join(', '))
    throw new Error(msg)
  }

  return data
}

// Interfaz pública de la API organizada por módulos de negocio
export const api = {
  auth: {
    register: (body) => request('POST', '/auth/register', body),
    login: (body) => request('POST', '/auth/login', body),
    verificar: (body) => request('POST', '/auth/verificar', body),
    reenviar: (body) => request('POST', '/auth/reenviar', body),
    me: () => request('GET', '/auth/me'),
    crearUsuarioPersonal: (body) => request('POST', '/auth/personal', body),
    listarPersonal: () => request('GET', '/auth/personal'),
    eliminarPersonal: (id) => request('DELETE', `/auth/personal/${id}`),
    cambiarPassword: (body) => request('POST', '/auth/cambiar-password', body)
  },

  alumno: {
    me: () => request('GET', '/alumnos/me')
  },

  solicitudes: {
    crear: (formData) => request('POST', '/solicitudes/', formData, { isMultipart: true }),
    mias: () => request('GET', '/solicitudes/mias'),
    detalle: (id) => request('GET', `/solicitudes/${id}`),
    subirInscripcion: (id, fd) => request('PATCH', `/solicitudes/${id}/documento/recibo_inscripcion`, fd, { isMultipart: true })
  },

  admin: {
    lista: (estado) => request('GET', `/admin/solicitudes${estado ? `?estado=${estado}` : ''}`),
    detalle: (id) => request('GET', `/admin/solicitudes/${id}`),
    cambiarEstado: (id, estado) => request('PATCH', `/admin/solicitudes/${id}/estado`, { estado }),
    listarGrupos: (carrera) => request('GET', `/dual/carrera/grupos${carrera ? `?carrera=${encodeURIComponent(carrera)}` : ''}`),
    documentUrl: (id, tipo) => `${BASE_URL}/admin/solicitudes/${id}/documento/${tipo}`,

    // Convocatorias de becas
    convocatoriaActiva: () => request('GET', '/admin/becas/convocatoria/activa'),
    crearConvocatoria: (body) => request('POST', '/admin/becas/convocatoria', body),
    cerrarConvocatoria: (id) => request('PATCH', `/admin/becas/convocatoria/${id}/cerrar`)
  },

  dual: {
    // Operaciones del alumno en modalidad dual
    subirReporte: (fd, isDebug = false) => request('POST', `/dual/alumno/${isDebug ? '?debug=true' : ''}`, fd, { isMultipart: true }),
    misReportes: (cuatrimestre) => request('GET', `/dual/alumno/mis-reportes${cuatrimestre ? `?cuatrimestre=${cuatrimestre}` : ''}`),
    semanaActual: () => request('GET', '/dual/alumno/semana-actual'),
    reportePdfUrl: (reporteId) => `${BASE_URL}/dual/alumno/reporte/${reporteId}/pdf`,

    // Operaciones del coordinador de vinculación dual
    listarReportes: (params) => request('GET', `/dual/coordinador/reportes${params ? `?${params}` : ''}`),
    revisarReporte: (id, data) => request('PATCH', `/dual/coordinador/reportes/${id}`, data),
    listarEmpresas: () => request('GET', '/dual/coordinador/empresas'),
    crearEmpresa: (body) => request('POST', '/dual/coordinador/empresas', body),
    asignarEmpresa: (body) => request('POST', '/dual/coordinador/asignaciones', body),
    buscarAlumno: (matricula) => request('GET', `/dual/coordinador/alumnos/${matricula}`),
    actualizarAlumnoDual: (matricula, body) => request('PATCH', `/dual/coordinador/alumnos/${matricula}`, body),
    cerrarCuatrimestre: (periodo_label) => request('POST', '/dual/coordinador/cierre', { periodo_label }),
    abrirCuatrimestre: (body) => request('POST', '/dual/coordinador/abrir-cuatrimestre', body),
    cuatrimestreActual: () => request('GET', '/dual/coordinador/cuatrimestre-actual'),
    alumnosSinReporte: (cuatrimestre, semana) => request('GET', `/dual/coordinador/alumnos-sin-reporte?cuatrimestre=${cuatrimestre}&semana=${semana}`),
    alumnosAtrasados: () => request('GET', '/dual/coordinador/alumnos-atrasados'),
    reportePdfUrlCoordinador: (reporteId) => `${BASE_URL}/dual/coordinador/reporte/${reporteId}/pdf`,

    // Operaciones del coordinador de carrera académica
    listarAlumnos: (params) => request('GET', `/dual/carrera/alumnos${params ? `?${params}` : ''}`),
    periodos: () => request('GET', '/dual/carrera/periodos'),
    expediente: (matricula, cuatrimestre) => request('GET', `/dual/carrera/alumnos/${matricula}/reportes${cuatrimestre ? `?cuatrimestre=${cuatrimestre}` : ''}`),
    reportePdfUrlCarrera: (reporteId) => `${BASE_URL}/dual/carrera/reporte/${reporteId}/pdf`,
    exportarCSV: async (matricula, cuatrimestre) => {
      const blob = await request('GET',
        `/dual/carrera/alumnos/${matricula}/exportar-csv${cuatrimestre ? `?cuatrimestre=${cuatrimestre}` : ''}`,
        null, { asBlob: true }
      )
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `expediente_${matricula}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    },

    // Operaciones de gestión académica
    crearGrupo: (body) => request('POST', '/dual/carrera/grupos', body),
    subirAlumnosCSV: (grupoId, fd) => request('POST', `/dual/carrera/grupos/${grupoId}/alumnos`, fd, { isMultipart: true }),
    agregarAlumno: (grupoId, body) => request('POST', `/dual/carrera/grupos/${grupoId}/alumnos/individual`, body),
    actualizarAlumno: (matricula, body) => request('PATCH', `/dual/carrera/alumnos/${matricula}`, body),
    eliminarAlumno: (matricula) => request('DELETE', `/dual/carrera/alumnos/${matricula}`),

    // Exportaciones
    exportarZip: async (matricula, cuatrimestre) => {
      const blob = await request('GET',
        `/dual/carrera/alumnos/${matricula}/exportar-zip${cuatrimestre ? `?cuatrimestre=${cuatrimestre}` : ''}`,
        null, { asBlob: true }
      )
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `expediente_${matricula}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }
  }
}