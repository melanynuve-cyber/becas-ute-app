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

  if (res.status === 401) {
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

// ── Auth ─────────────────────────────────────────────
export const api = {
  auth: {
    register: (body) => request('POST', '/auth/register', body),
    login:    (body) => request('POST', '/auth/login', body),
    verificar:(body) => request('POST', '/auth/verificar', body),
    reenviar: (body) => request('POST', '/auth/reenviar', body),
    me:       ()     => request('GET',  '/auth/me')
  },

  // ── Alumno ─────────────────────────────────────────
  alumno: {
    me: () => request('GET', '/alumnos/me')
  },

  // ── Solicitudes ─────────────────────────────────────
  solicitudes: {
    crear:            (formData) => request('POST', '/solicitudes/', formData, true),
    mias:             ()         => request('GET',  '/solicitudes/mias'),
    detalle:          (id)       => request('GET',  `/solicitudes/${id}`),
    subirInscripcion: (id, fd)   => request('PATCH', `/solicitudes/${id}/documento/recibo_inscripcion`, fd, true),
  },

  // ── Admin ───────────────────────────────────────────
  admin: {
    lista:        (estado)     => request('GET', `/admin/solicitudes${estado ? `?estado=${estado}` : ''}`),
    detalle:      (id)         => request('GET', `/admin/solicitudes/${id}`),
    cambiarEstado:(id, estado) => request('PATCH', `/admin/solicitudes/${id}/estado`, { estado }),
    documentoUrl: (id, tipo)   => `${BASE_URL}/admin/solicitudes/${id}/documento/${tipo}`
  },

  // ── Dual ────────────────────────────────────────────
  dual: {
    subirReporte:   (fd)          => request('POST',  '/dual/alumno/', fd, true),
    misReportes:    (cuatrimestre) => request('GET',   `/dual/alumno/mis-reportes${cuatrimestre ? `?cuatrimestre=${cuatrimestre}` : ''}`),
    listarReportes: (params)      => request('GET',   `/dual/agente/reportes${params ? `?${params}` : ''}`),
    revisarReporte: (id, data)    => request('PATCH', `/dual/agente/reportes/${id}`, data),
    listarAlumnos:  (params)      => request('GET',   `/dual/tutor/alumnos${params ? `?${params}` : ''}`),
    expediente:     (matricula)   => request('GET',   `/dual/tutor/alumnos/${matricula}/reportes`),
    exportarCSV:    (matricula)   => `${BASE_URL}/dual/tutor/alumnos/${matricula}/exportar-csv`,
    buscarAlumno: (matricula) => request('GET', `/dual/agente/alumnos/${matricula}`),
    actualizarAlumnoDual: (matricula, body) => request('PATCH', `/dual/agente/alumnos/${matricula}`, body),
    listarEmpresas: ()     => request('GET',  '/dual/agente/empresas'),
    crearEmpresa:   (body) => request('POST', '/dual/agente/empresas', body),
    asignarEmpresa: (body) => request('POST', '/dual/agente/asignaciones', body),
  }
}