// src/lib/stores/auth.js
import { writable, derived } from 'svelte/store'

const storedToken = sessionStorage.getItem('ute_token')
const storedUser = sessionStorage.getItem('ute_user')

let parsedUser = null
if (storedUser) {
  try { parsedUser = JSON.parse(storedUser) } catch { parsedUser = null }
}

export const token = writable(storedToken || null)
export const user = writable(parsedUser)

// Sincronización con el almacenamiento de sesión
token.subscribe((val) => val ? sessionStorage.setItem('ute_token', val) : sessionStorage.removeItem('ute_token'))
user.subscribe((val) => val ? sessionStorage.setItem('ute_user', JSON.stringify(val)) : sessionStorage.removeItem('ute_user'))

// Estados derivados de autenticación y permisos
export const isAuthenticated = derived(token, ($token) => Boolean($token))
export const isAdmin = derived(user, ($user) => Boolean($user?.roles?.admin))
export const isCoordinadorBecas = derived(user, ($user) => Boolean($user?.roles?.coordinador_becas || $user?.roles?.admin))
export const isAlumnoDual = derived(user, ($user) => Boolean($user?.dual_activo || $user?.roles?.admin))
export const isCoordinadorDual = derived(user, ($user) => Boolean($user?.roles?.coordinador_dual || $user?.roles?.admin))
export const isCoordinadorCarrera = derived(user, ($user) => Boolean($user?.roles?.coordinador_carrera || $user?.roles?.admin))

// Acciones de sesión
export function logout() {
  token.set(null)
  user.set(null)
}

export function login(jwtToken, userData) {
  token.set(jwtToken)
  user.set(userData)
}