import { writable, derived } from 'svelte/store'

// Token JWT — guardado también en sessionStorage para sobrevivir recargas
const storedToken = sessionStorage.getItem('ute_token')
const storedUser  = sessionStorage.getItem('ute_user')

export const token = writable(storedToken || null)
export const user  = writable(storedUser ? JSON.parse(storedUser) : null)

// Sincronizar con sessionStorage cuando cambian
token.subscribe(val => {
  if (val) sessionStorage.setItem('ute_token', val)
  else sessionStorage.removeItem('ute_token')
})

user.subscribe(val => {
  if (val) sessionStorage.setItem('ute_user', JSON.stringify(val))
  else sessionStorage.removeItem('ute_user')
})

// Derived: ¿está logueado?
export const isAuthenticated = derived(token, $token => !!$token)

// Derived: ¿es admin?
export const isAdmin = derived(user, $user => !!$user?.roles?.admin)

// Acción de logout
export function logout() {
  token.set(null)
  user.set(null)
}

// Acción de login — guarda token y datos del usuario
export function login(jwtToken, userData) {
  token.set(jwtToken)
  user.set(userData)
}
