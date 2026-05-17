<script>
  // src/routes/Register.svelte
  // Importaciones
  import { navigate, link } from 'svelte-routing'
  import { onMount } from 'svelte'
  import { api } from '../lib/services/api.js'
  import { isAuthenticated } from '../lib/stores/auth.js'
  import { get } from 'svelte/store'

  // Variables de estado
  let email = ''
  let password = ''
  let confirmPassword = ''
  let loading = false
  let error = ''

  // Redirección por sesión activa
  onMount(() => {
    if (get(isAuthenticated)) navigate('/dashboard', { replace: true })
  })

  // Validación y envío del formulario
  async function handleSubmit() {
    error = ''
    if (!email.endsWith('@ute.edu.mx')) {
      error = 'Debes usar tu correo institucional (@ute.edu.mx)'
      return
    }
    if (password.length < 6) {
      error = 'La contraseña debe tener al menos 6 caracteres'
      return
    }
    if (password !== confirmPassword) {
      error = 'Las contraseñas no coinciden'
      return
    }
    loading = true
    try {
      await api.auth.register({ email, password })
      navigate(`/verificar?email=${encodeURIComponent(email)}`, { replace: true })
    } catch (e) {
      error = e.message
    } finally {
      loading = false
    }
  }
</script>

<div class="page">
  <div class="card">
    <div class="header">
      <img src="/UTEG-01.png" alt="Universidad Tecnológica Gral. Mariano Escobedo" class="logo-ute" />
    </div>

    <h1 class="title">Registro</h1>

    {#if error}
      <div class="error-msg">{error}</div>
    {/if}

    <div class="form">
      <div class="input-group">
        <label for="email">Correo Institucional (@ute.edu.mx)</label>
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
            placeholder="220010234@ute.edu.mx"
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
            autocomplete="new-password"
          />
        </div>
      </div>

      <div class="input-group">
        <label for="confirm">Confirmar Contraseña</label>
        <div class="input-wrap">
          <span class="icon">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
            </svg>
          </span>
          <input
            id="confirm"
            type="password"
            bind:value={confirmPassword}
            placeholder="••••••••"
            autocomplete="new-password"
          />
        </div>
      </div>

      <button class="btn-primary" on:click={handleSubmit} disabled={loading || !email || !password || !confirmPassword}>
        {#if loading}
          <span class="spinner"></span> Registrando...
        {:else}
          Registrar
        {/if}
      </button>

      <p class="bottom-text">
        ¿Ya tienes cuenta? <a href="/login" class="link-orange" use:link>Iniciar Sesión</a>
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
  .title    { font-size: 24px; font-weight: 700; text-align: center; }
  .form     { display: flex; flex-direction: column; gap: 16px; }
  .bottom-text { text-align: center; font-size: 13px; color: var(--text-secondary); }
  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>