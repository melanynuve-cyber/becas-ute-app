// src/lib/stores/auth.js
import { writable, derived } from 'svelte/store'

const storedToken = sessionStorage.getItem('ute_token')
const storedUser  = sessionStorage.getItem('ute_user')

export const token = writable(storedToken || null)
export const user  = writable(storedUser ? JSON.parse(storedUser) : null)

// Sincronizar el token de autenticación con sessionStorage
token.subscribe(val => {
  if (val) sessionStorage.setItem('ute_token', val)
  else sessionStorage.removeItem('ute_token')
})

// Sincronizar los datos del usuario con sessionStorage
user.subscribe(val => {
  if (val) sessionStorage.setItem('ute_user', JSON.stringify(val))
  else sessionStorage.removeItem('ute_user')
})

// Validar si el usuario tiene una sesión activa
export const isAuthenticated = derived(token, $token => !!$token)

// Validar si el usuario es administrador o coordinador de becas
export const isAdmin = derived(user, $user =>
  !!($user?.roles?.coordinador_becas || $user?.roles?.admin)
)

// Validar si el alumno pertenece a la modalidad dual activa
export const isAlumnoDual = derived(user, $user =>
  !!($user?.dual_activo || $user?.roles?.admin)
)

// Validar si el usuario es coordinador de la modalidad dual
export const isAgenteDual = derived(user, $user =>
  !!($user?.roles?.coordinador_dual || $user?.roles?.admin)
)

// Validar si el usuario es coordinador de carrera o tutor
export const isTutor = derived(user, $user =>
  !!($user?.roles?.coordinador_carrera || $user?.roles?.admin)
)

// Validar si el usuario cuenta con permisos de directivo
export const isDirectivo = derived(user, $user =>
  !!($user?.roles?.coordinador_carrera || $user?.roles?.admin)
)

// Limpiar el estado de autenticación y cerrar sesión
export function logout() {
  token.set(null)
  user.set(null)
}

// Registrar el token y los datos del usuario al iniciar sesión
export function login(jwtToken, userData) {
  token.set(jwtToken)
  user.set(userData)
}
