import { writable, derived } from 'svelte/store'

const storedToken = sessionStorage.getItem('ute_token')
const storedUser  = sessionStorage.getItem('ute_user')

export const token = writable(storedToken || null)
export const user  = writable(storedUser ? JSON.parse(storedUser) : null)

token.subscribe(val => {
  if (val) sessionStorage.setItem('ute_token', val)
  else sessionStorage.removeItem('ute_token')
})

user.subscribe(val => {
  if (val) sessionStorage.setItem('ute_user', JSON.stringify(val))
  else sessionStorage.removeItem('ute_user')
})

export const isAuthenticated = derived(token, $token => !!$token)

export const isAdmin = derived(user, $user =>
  !!($user?.roles?.agente_becas || $user?.roles?.root)
)

export const isAlumnoDual = derived(user, $user =>
  !!($user?.roles?.alumno_dual || $user?.roles?.root)
)

export const isAgenteDual = derived(user, $user =>
  !!($user?.roles?.agente_dual || $user?.roles?.root)
)

export const isTutor = derived(user, $user =>
  !!($user?.roles?.agente_tutor || $user?.roles?.agente_directivo || $user?.roles?.root)
)

export const isDirectivo = derived(user, $user =>
  !!($user?.roles?.agente_directivo || $user?.roles?.root)
)

export function logout() {
  token.set(null)
  user.set(null)
}

export function login(jwtToken, userData) {
  token.set(jwtToken)
  user.set(userData)
}
