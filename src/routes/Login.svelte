<script>
  // src/routes/Login.svelte
  import { navigate, link } from 'svelte-routing'
  import { fade } from 'svelte/transition'
  import { onMount } from 'svelte'
  import { api } from '../lib/services/api.js'
  import { login, isAuthenticated, isAdmin, isCoordinadorDual, isCoordinadorCarrera } from '../lib/stores/auth.js'
  import { get } from 'svelte/store'

  let email = ''
  let password = ''
  let loading = false
  let error = ''
  let showPassword = false

  onMount(() => {
    if (get(isAuthenticated)) {
      if (get(isAdmin)) navigate('/admin/solicitudes', { replace: true })
      else if (get(isCoordinadorDual)) navigate('/dual/coordinador', { replace: true })
      else if (get(isCoordinadorCarrera)) navigate('/dual/carrera', { replace: true })
      else navigate('/dashboard', { replace: true })
    }
  })

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    if (!email.endsWith('@ute.edu.mx')) {
      error = 'Debes usar tu correo institucional (@ute.edu.mx)'
      return
    }
    loading = true
    try {
      const res = await api.auth.login({ email, password })
      if (!res || !res.access_token) throw new Error('Contraseña incorrecta o usuario no encontrado.')
      
      const payload = JSON.parse(atob(res.access_token.split('.')[1]))
      const userData = { 
        roles: payload.roles, 
        matricula: payload.matricula, 
        email: payload.sub, 
        dual_activo: payload.dual_activo 
      }
      
      login(res.access_token, userData)
      
      if (payload.roles?.admin || payload.roles?.root) navigate('/admin/solicitudes', { replace: true })
      else if (payload.roles?.coordinador_dual) navigate('/dual/coordinador', { replace: true })
      else if (payload.roles?.coordinador_carrera) navigate('/dual/carrera', { replace: true })
      else navigate('/dashboard', { replace: true })
      
    } catch (e) {
      error = e.message === "Cannot read properties of undefined (reading 'access_token')"
        ? 'Contraseña incorrecta o usuario no encontrado.'
        : (e.message || 'Error al conectar con el servidor.')
    } finally {
      loading = false
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') handleSubmit(e) 
  }
</script>

<div class="page">
  <div class="card" in:fade>
    <div class="header">
      <img src="/UTEG-01.png" alt="Universidad Tecnológica" class="logo-ute" />
      <h1 class="title">Iniciar Sesión</h1>
      <p class="subtitle">Ingresa a tu cuenta institucional del sistema</p>
    </div>

    {#if error}
      <div class="error-msg">{error}</div>
    {/if}

    <div class="form">
      <div class="input-group">
        <label for="email">Correo Institucional</label>
        <div class="input-wrap">
          <span class="icon">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
          </span>
          <input
            id="email" type="email" bind:value={email} placeholder="usuario@ute.edu.mx"
            on:keydown={handleKeydown} on:input={() => error = ''} autocomplete="email"
          />
        </div>
      </div>

      <div class="input-group">
        <label for="password">Contraseña</label>
        <div class="input-wrap">
          <span class="icon">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
            </svg>
          </span>
          
          {#if showPassword}
            <input
              id="password" type="text" bind:value={password}
              placeholder="••••••••" on:keydown={handleKeydown} on:input={() => error = ''} autocomplete="current-password"
            />
          {:else}
            <input
              id="password" type="password" bind:value={password}
              placeholder="••••••••" on:keydown={handleKeydown} on:input={() => error = ''} autocomplete="current-password"
            />
          {/if}

          <button type="button" class="eye-btn" on:click={() => showPassword = !showPassword} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            {#if showPassword}
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
            {:else}
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            {/if}
          </button>
        </div>
      </div>

      <div class="forgot-row">
        <button class="link-orange forgot-link" on:click={() => alert('Contacta a Servicios Estudiantiles.')}>
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <button class="btn-primary" on:click={handleSubmit} disabled={loading || !email || !password}>
        {#if loading}
          <span class="spinner"></span> Ingresando...
        {:else}
          Iniciar Sesión
        {/if}
      </button>

      <p class="bottom-text">
        ¿No tienes cuenta? <a href="/register" class="link-orange" use:link>Registrarme</a>
      </p>
    </div>
  </div>
</div>

<style>
  .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px 16px; background: var(--bg-page); }
  .card { background: var(--bg-card); border-radius: var(--radius-card); border: 1px solid var(--border); box-shadow: var(--shadow-card); padding: 36px 32px; width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 20px; }
  .header { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; }
  .logo-ute { height: 76px; width: auto; object-fit: contain; margin-bottom: 8px; }
  .title { font-size: 22px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
  .subtitle { font-size: 13px; color: var(--text-secondary); }
  .form { display: flex; flex-direction: column; gap: 16px; }
  
  :global(.input-wrap input) { padding-right: 42px !important; }
  .forgot-row { display: flex; justify-content: flex-end; margin-top: -4px; }
  .forgot-row .forgot-link { font-size: 13px; background: none; border: none; cursor: pointer; padding: 0; font-family: var(--font); }
  .bottom-text { text-align: center; font-size: 13px; color: var(--text-secondary); margin-top: 8px; }
  
  .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  .eye-btn { position: absolute; right: 14px; background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; color: var(--text-disabled); transition: color 0.15s ease; }
  .eye-btn:hover { color: var(--text-secondary); }
</style>