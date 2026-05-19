// src/lib/services/api.js
import { get } from 'svelte/store'
import { 
  token, 
  logout 
} from '../stores/auth.js'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Manejador centralizado de peticiones HTTP
async function request(method, path, body = null, isMultipart = false) {
  const headers = {}
  const jwt = get(token)

  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`
  }
  
  if (!isMultipart && body) {
    headers['Content-Type'] = 'application/json'
  }

  // Desglose del cuerpo de la petición según el tipo de codificación
  const requestBody = isMultipart
    ? body
    : body
      ? JSON.stringify(body)
      : null

  const config = {
    method,
    headers,
    body: requestBody
  }

  const res = await fetch(
    `${BASE_URL}${path}`, 
    config
  )

  // Interceptor para vencimiento de sesión (Excluye el login)
  if (res.status === 401 && path !== '/auth/login') {
    logout()
    window.location.href = '/login'
    return
  }

  const data = await res
    .json()
    .catch(() => {
      return {}
    })

  // Manejo de excepciones y parseo de errores multiplexados del backend
  if (!res.ok) {
    const msg = data?.detail || 'Error en el servidor'
    
    if (Array.isArray(msg)) {
      const errorString = msg
        .map((e) => {
          return e.msg
        })
        .join(', ')
        
      throw new Error(errorString)
    }
    
    throw new Error(msg)
  }

  return data
}

// Interfaz pública de la API organizada por módulos de negocio
export const api = {
  auth: {
    register: (body) => {
      return request('POST', '/auth/register', body)
    },
    login: (body) => {
      return request('POST', '/auth/login', body)
    },
    verificar: (body) => {
      return request('POST', '/auth/verificar', body)
    },
    reenviar: (body) => {
      return request('POST', '/auth/reenviar', body)
    },
    me: () => {
      return request('GET', '/auth/me')
    },
    crearUsuarioPersonal: (body) => {
      return request('POST', '/auth/personal', body)
    },
    listarPersonal: () => {
      return request('GET', '/auth/personal')
    },
    eliminarPersonal: (id) => {
      return request('DELETE', `/auth/personal/${id}`)
    }
  },

  alumno: {
    me: () => {
      return request('GET', '/alumnos/me')
    }
  },

  solicitudes: {
    crear: (formData) => {
      return request(
        'POST', 
        '/solicitudes/', 
        formData, 
        true
      )
    },
    mias: () => {
      return request('GET', '/solicitudes/mias')
    },
    detalle: (id) => {
      return request('GET', `/solicitudes/${id}`)
    },
    subirInscripcion: (id, fd) => {
      return request(
        'PATCH', 
        `/solicitudes/${id}/documento/recibo_inscripcion`, 
        fd, 
        true
      )
    }
  },

  admin: {

    lista: (estado) => {
      const queryParam = estado 
        ? `?estado=${estado}` 
        : ''
      return request(
        'GET', 
        `/admin/solicitudes${queryParam}`
      )
    },
    detalle: (id) => {
      return request('GET', `/admin/solicitudes/${id}`)
    },
    cambiarEstado: (id, estado) => {
      return request(
        'PATCH', 
        `/admin/solicitudes/${id}/estado`, 
        { estado }
      )
    },
    documentUrl: (id, tipo) => {
      return `${BASE_URL}/admin/solicitudes/${id}/documento/${tipo}`
    }
  },

  dual: {
    // Operaciones del alumno en modalidad dual
    subirReporte: (fd) => {
      return request(
        'POST', 
        '/dual/alumno/', 
        fd, 
        true
      )
    },
    misReportes: (cuatrimestre) => {
      const queryParam = cuatrimestre 
        ? `?cuatrimestre=${cuatrimestre}` 
        : ''
      return request(
        'GET', 
        `/dual/alumno/mis-reportes${queryParam}`
      )
    },

    // Operaciones del coordinador de vinculación dual
    listarReportes: (params) => {
      const queryParam = params 
        ? `?${params}` 
        : ''
      return request(
        'GET', 
        `/dual/coordinador/reportes${queryParam}`
      )
    },
    revisarReporte: (id, data) => {
      return request(
        'PATCH', 
        `/dual/coordinador/reportes/${id}`, 
        data
      )
    },
    listarEmpresas: () => {
      return request('GET', '/dual/coordinador/empresas')
    },
    crearEmpresa: (body) => {
      return request(
        'POST', 
        '/dual/coordinador/empresas', 
        body
      )
    },
    asignarEmpresa: (body) => {
      return request(
        'POST', 
        '/dual/coordinador/asignaciones', 
        body
      )
    },
    buscarAlumno: (matricula) => {
      return request(
        'GET', 
        `/dual/coordinador/alumnos/${matricula}`
      )
    },
    actualizarAlumnoDual: (matricula, body) => {
      return request(
        'PATCH', 
        `/dual/coordinador/alumnos/${matricula}`, 
        body
      )
    },

    // Operaciones del coordinador de carrera académica
    listarAlumnos: (params) => {
      const queryParam = params 
        ? `?${params}` 
        : ''
      return request(
        'GET', 
        `/dual/carrera/alumnos${queryParam}`
      )
    },
    expediente: (matricula, cuatrimestre) => {
      const queryParam = cuatrimestre 
        ? `?cuatrimestre=${cuatrimestre}` 
        : ''
      return request(
        'GET', 
        `/dual/carrera/alumnos/${matricula}/reportes${queryParam}`
      )
    },
    exportarCSV: (matricula) => {
      return `${BASE_URL}/dual/carrera/alumnos/${matricula}/exportar-csv`
    },
    // Operaciones de gestión académica
    crearGrupo: (body) => {
      return request('POST', '/dual/carrera/grupos', body)
    },
    subirAlumnosCSV: (grupoId, fd) => {
      return request('POST', `/dual/carrera/grupos/${grupoId}/alumnos`, fd, true)
    },
    semanaActual: () => {
      return request('GET', '/dual/alumno/semana-actual')
    },
  }
}


  