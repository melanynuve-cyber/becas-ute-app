// src/lib/stores/auth.js
import { 
  writable, 
  derived 
} from 'svelte/store'

// Recuperación de credenciales persistidas en la sesión
const storedToken = sessionStorage.getItem('ute_token')
const storedUser = sessionStorage.getItem('ute_user')

// Inicialización segura del estado del usuario
const initialUser = storedUser 
  ? JSON.parse(storedUser) 
  : null

export const token = writable(storedToken || null)
export const user = writable(initialUser)

// Sincronización del token con el almacenamiento de sesión
token.subscribe((val) => {
  if (val) {
    sessionStorage.setItem('ute_token', val)
  } else {
    sessionStorage.removeItem('ute_token')
  }
})

// Sincronización del usuario con el almacenamiento de sesión
user.subscribe((val) => {
  if (val) {
    const userString = JSON.stringify(val)
    sessionStorage.setItem('ute_user', userString)
  } else {
    sessionStorage.removeItem('ute_user')
  }
})

// Estado derivado: Verificación de sesión activa
export const isAuthenticated = derived(
  token, 
  ($token) => {
    return Boolean($token)
  }
)

// Estado derivado: Permisos de Administrador o Coordinador de Becas
export const isAdmin = derived(
  user, 
  ($user) => {
    const esCoordinadorBecas = $user?.roles?.coordinador_becas
    const esAdmin = $user?.roles?.admin
    
    return Boolean(esCoordinadorBecas || esAdmin)
  }
)

// Estado derivado: Permisos de Alumno con Modalidad Dual activa
export const isAlumnoDual = derived(
  user, 
  ($user) => {
    const tieneDualActivo = $user?.dual_activo
    const esAdmin = $user?.roles?.admin
    
    return Boolean(tieneDualActivo || esAdmin)
  }
)

// Estado derivado: Permisos de Coordinador del Programa Dual
export const isCoordinadorDual = derived(
  user, 
  ($user) => {
    const esCoordinadorDual = $user?.roles?.coordinador_dual
    const esAdmin = $user?.roles?.admin
    
    return Boolean(esCoordinadorDual || esAdmin)
  }
)

// Estado derivado: Permisos de Coordinador de Carrera Académica
export const isCoordinadorCarrera = derived(
  user, 
  ($user) => {
    const esCoordinadorCarrera = $user?.roles?.coordinador_carrera
    const esAdmin = $user?.roles?.admin
    
    return Boolean(esCoordinadorCarrera || esAdmin)
  }
)

// Destrucción de variables de estado para el cierre de sesión
export function logout() {
  token.set(null)
  user.set(null)
}

// Mutación de variables de estado para el inicio de sesión
export function login(jwtToken, userData) {
  token.set(jwtToken)
  user.set(userData)
}