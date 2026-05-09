<script>
  import { navigate, link } from 'svelte-routing'
  import { fade } from 'svelte/transition'
  import { onMount } from 'svelte'
  import { api } from '../../lib/services/api.js'
  import { login, isAuthenticated, isAdmin } from '../../lib/stores/auth.js'
  import { get } from 'svelte/store'

  let email = ''
  let password = ''
  let loading = false
  let error = ''

  onMount(() => {
    if (get(isAuthenticated)) {
      navigate(get(isAdmin) ? '/admin/solicitudes' : '/dashboard', { replace: true })
    }
  })

  async function handleSubmit() {
    error = ''
    if (!email.endsWith('@ute.edu.mx')) {
      error = 'Debes usar tu correo institucional (@ute.edu.mx)'
      return
    }
    loading = true
    try {
      const res = await api.auth.login({ email, password })
      const payload = JSON.parse(atob(res.access_token.split('.')[1]))
      const userData = { roles: payload.roles, matricula: payload.matricula, email: payload.sub }
      login(res.access_token, userData)
      navigate(payload.roles?.admin ? '/admin/solicitudes' : '/dashboard', { replace: true })
    } catch (e) {
      error = e.message
    } finally {
      loading = false
    }
}

  function handleKeydown(e) {
    if (e.key === 'Enter') handleSubmit()
  }
</script>

<div class="page">
  <div class="card" in:fade>
    <div class="header">
      <img src="/UTEG-01.png" alt="Universidad Tecnológica Gral. Mariano Escobedo" class="logo-ute" />
    </div>

    <h1 class="title">Iniciar Sesión</h1>

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
            id="email"
            type="email"
            bind:value={email}
            placeholder="usuario@ute.edu.mx"
            on:keydown={handleKeydown}
            autocomplete="email"
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
          <input
            id="password"
            type="password"
            bind:value={password}
            placeholder="••••••••"
            on:keydown={handleKeydown}
            autocomplete="current-password"
          />
        </div>
      </div>

      <div class="forgot-row">
        <button class="link-orange forgot-link" on:click={() => alert('Contacta a Servicios Estudiantiles para recuperar tu contraseña.')}>
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
        ¿No tienes cuenta?
        <a href="/register" class="link-orange" use:link>Registrarme</a>
      </p>
    </div>
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    background: var(--bg-page);
  }

  .card {
    background: var(--bg-card);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    padding: 40px 36px;
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  
  .logo-ute {
    height: 150px;
    width: auto;
    object-fit: contain;
  }

  .title {
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    color: var(--text-primary);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .forgot-row {
    display: flex;
    justify-content: flex-end;
    margin-top: -4px;
  }
  .forgot-row .forgot-link {
    font-size: 13px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: var(--font);
  }

  .bottom-text {
    text-align: center;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
