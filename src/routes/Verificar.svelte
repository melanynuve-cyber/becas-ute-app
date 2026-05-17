// src/routes/Verificar.svelte
<script>
  // Importaciones
  import { navigate } from 'svelte-routing'
  import { onMount } from 'svelte'
  import { api } from '../lib/services/api.js'

  // Recuperación de parámetros de la URL
  const params  = new URLSearchParams(window.location.search)
  const email   = params.get('email') || ''
  const autoCode = params.get('codigo') || ''

  // Variables de estado
  let digits = ['', '', '', '', '', '']
  let inputs = []
  let loading = false
  let error = ''
  let resendMsg = ''

  // Autocompletado desde URL
  onMount(() => {
    if (autoCode && autoCode.length === 6) {
      digits = autoCode.split('')
      setTimeout(submitCode, 300)
    }
  })

  // Control de entrada de dígitos
  function handleInput(i, e) {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    digits[i] = val
    digits = [...digits]
    if (val && i < 5) inputs[i + 1]?.focus()
  }

  // Soporte de navegación con teclado
  function handleKeydown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs[i - 1]?.focus()
    }
  }

  // Soporte para pegar código completo
  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      digits = pasted.split('')
      inputs[5]?.focus()
    }
    e.preventDefault()
  }

  // Estados computados del código
  $: code = digits.join('')
  $: isComplete = code.length === 6

  // Envío del código de verificación
  async function submitCode() {
    if (!isComplete) return
    error = ''
    loading = true
    try {
      await api.auth.verificar({ email, codigo: code })
      navigate('/login?verified=1', { replace: true })
    } catch (e) {
      error = e.message
      digits = ['', '', '', '', '', '']
      inputs[0]?.focus()
    } finally {
      loading = false
    }
  }

  // Solicitud de reenvío de correo
  async function reenviar() {
    resendMsg = ''
    error = ''
    try {
      await api.auth.reenviar({ email })
      resendMsg = 'Código reenviado. Revisa tu correo.'
    } catch (e) {
      error = e.message
    }
  }
</script>

<div class="page">
  <div class="card">
    <div class="shield-icon">
      <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="color: var(--orange)">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
      </svg>
    </div>

    <div class="texts">
      <h1 class="title">Verificación de Código</h1>
      <p class="subtitle">
        Se envió un código de verificación al correo:<br/>
        <strong class="email-highlight">{email || 'tu correo institucional'}</strong>
      </p>
    </div>

    {#if error}
      <div class="error-msg">{error}</div>
    {/if}
    {#if resendMsg}
      <div class="success-msg">{resendMsg}</div>
    {/if}

    <div class="digits-row" on:paste={handlePaste}>
      {#each digits as digit, i}
        <input
          bind:this={inputs[i]}
          class="digit-input"
          type="text"
          inputmode="numeric"
          maxlength="1"
          value={digit}
          on:input={(e) => handleInput(i, e)}
          on:keydown={(e) => handleKeydown(i, e)}
          class:filled={digit !== ''}
        />
      {/each}
    </div>

    <button class="btn-primary" on:click={submitCode} disabled={!isComplete || loading}>
      {#if loading}
        <span class="spinner"></span> Verificando...
      {:else}
        Aceptar
      {/if}
    </button>

    <button class="resend-btn" on:click={reenviar}>Reenviar código</button>
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
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }
  .shield-icon {
    width: 60px;
    height: 60px;
    background: var(--orange-light);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .texts { text-align: center; }
  .title { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
  .subtitle { font-size: 14px; color: var(--text-secondary); line-height: 1.5; }
  .email-highlight { color: var(--orange); font-weight: 600; }

  .digits-row {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  .digit-input {
    width: 46px;
    height: 54px;
    text-align: center;
    font-size: 22px;
    font-weight: 700;
    font-family: var(--font);
    border: 1.5px solid var(--border-input);
    border-radius: 10px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    color: var(--text-primary);
    background: #fff;
    caret-color: var(--orange);
  }
  .digit-input:focus {
    border-color: var(--orange);
    box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
  }
  .digit-input.filled {
    border-color: var(--orange);
    background: var(--orange-light);
  }

  .resend-btn {
    background: none;
    border: none;
    color: var(--orange);
    font-family: var(--font);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    padding: 4px 8px;
  }
  .resend-btn:hover { text-decoration: underline; }

  .success-msg {
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    color: #15803D;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 500;
    width: 100%;
    text-align: center;
  }
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