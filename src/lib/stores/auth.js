// src/lib/stores/auth.js
import { writable, derived } from 'svelte/store'

const storedToken = sessionStorage.getItem('ute_token')
const storedUser  = sessionStorage.getItem('ute_user')

export const token = writable(storedToken || null)
export const user  = writable(storedUser ? JSON.parse(storedUser) : null)

// Sincronización con sessionStorage
token.subscribe(val => {
  if (val) sessionStorage.setItem('ute_token', val)
  else sessionStorage.removeItem('ute_token')
})

user.subscribe(val => {
  if (val) sessionStorage.setItem('ute_user', JSON.stringify(val))
  else sessionStorage.removeItem('ute_user')
})

// Estados derivados de autenticación y roles
export const isAuthenticated = derived(token, $token => !!$token)

export const isAdmin = derived(user, $user =>
  !!($user?.roles?.coordinador_becas || $user?.roles?.admin)
)

export const isAlumnoDual = derived(user, $user =>
  !!($user?.dual_activo || $user?.roles?.admin)
)

export const isCoordinadorDual = derived(user, $user =>
  !!($user?.roles?.coordinador_dual || $user?.roles?.admin)
)

export const isCoordinadorCarrera = derived(user, $user =>
  !!($user?.roles?.coordinador_carrera || $user?.roles?.admin)
)

// Métodos de control de sesión
export function logout() {
  token.set(null)
  user.set(null)
}

export function login(jwtToken, userData) {
  token.set(jwtToken)
  user.set(userData)
}