// src/lib/services/api.js
import { get } from 'svelte/store'
import { token, logout } from '../stores/auth.js'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(method, path, body = null, isMultipart = false) {
  const headers = {}
  const jwt = get(token)

  if (jwt) headers['Authorization'] = `Bearer ${jwt}`
  if (!isMultipart && body) headers['Content-Type'] = 'application/json'

  const config = {
    method,
    headers,
    body: isMultipart ? body : body ? JSON.stringify(body) : null
  }

  const res = await fetch(`${BASE_URL}${path}`, config)

  if (res.status === 401 && path !== '/auth/login') {
    logout()
    window.location.href = '/login'
    return
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg = data?.detail || 'Error en el servidor'
    throw new Error(Array.isArray(msg) ? msg.map(e => e.msg).join(', ') : msg)
  }

  return data
}

// Endpoints de autenticación y manejo de sesiones
export const api = {
  auth: {
    register: (body) => request('POST', '/auth/register', body),
    login:    (body) => request('POST', '/auth/login', body),
    verificar:(body) => request('POST', '/auth/verificar', body),
    reenviar: (body) => request('POST', '/auth/reenviar', body),
    me:       ()     => request('GET',  '/auth/me'),
  },

  // Consulta de información del perfil del alumno
  alumno: {
    me: () => request('GET', '/alumnos/me'),
  },

  // Gestión de solicitudes de becas internas y expedientes
  solicitudes: {
    crear:            (formData) => request('POST',  '/solicitudes/', formData, true),
    mias:             ()         => request('GET',   '/solicitudes/mias'),
    detalle:          (id)       => request('GET',   `/solicitudes/${id}`),
    subirInscripcion: (id, fd)   => request('PATCH', `/solicitudes/${id}/documento/recibo_inscripcion`, fd, true),
  },

  // Panel de administración de becas para dictamen de solicitudes
  admin: {
    lista:        (estado)     => request('GET',   `/admin/solicitudes${estado ? `?estado=${estado}` : ''}`),
    detalle:      (id)         => request('GET',   `/admin/solicitudes/${id}`),
    cambiarEstado:(id, estado) => request('PATCH', `/admin/solicitudes/${id}/estado`, { estado }),
    documentUrl:  (id, tipo)   => `${BASE_URL}/admin/solicitudes/${id}/documento/${tipo}`,
  },

  // Endpoints correspondientes a la modalidad dual
  dual: {
    // Operaciones del alumno dual
    subirReporte: (fd)             => request('POST', '/dual/alumno/', fd, true),
    misReportes:  (cuatrimestre)   => request('GET',  `/dual/alumno/mis-reportes${cuatrimestre ? `?cuatrimestre=${cuatrimestre}` : ''}`),

    // Operaciones del coordinador dual
    listarReportes:      (params)        => request('GET',   `/dual/coordinador/reportes${params ? `?${params}` : ''}`),
    revisarReporte:      (id, data)      => request('PATCH', `/dual/coordinador/reportes/${id}`, data),
    listarEmpresas:      ()              => request('GET',   '/dual/coordinador/empresas'),
    crearEmpresa:        (body)          => request('POST',  '/dual/coordinador/empresas', body),
    asignarEmpresa:      (body)          => request('POST',  '/dual/coordinador/asignaciones', body),
    buscarAlumno:        (matricula)     => request('GET',   `/dual/coordinador/alumnos/${matricula}`),
    actualizarAlumnoDual:(matricula, body) => request('PATCH', `/dual/coordinador/alumnos/${matricula}`, body),

    // Operaciones del coordinador de carrera
    listarAlumnos: (params)                  => request('GET', `/dual/carrera/alumnos${params ? `?${params}` : ''}`),
    expediente:    (matricula, cuatrimestre) => {
      const params = cuatrimestre ? `?cuatrimestre=${cuatrimestre}` : ''
      return request('GET', `/dual/carrera/alumnos/${matricula}/reportes${params}`)
    },
    exportarCSV: (matricula) => `${BASE_URL}/dual/carrera/alumnos/${matricula}/exportar-csv`,
  },
}
