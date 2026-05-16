<script>
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated, isAdmin } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/Navbar.svelte'
  import PerfilModal from '../../lib/components/PerfilModal.svelte'
  import { estadoBadgeClass, estadoLabel } from '../../lib/utils.js'

  let alumno      = null
  let solicitudes = []
  let loading     = true
  let loadError   = false
  let showPerfil  = false

  onMount(async () => {
    if (!get(isAuthenticated)) { navigate('/login',             { replace: true }); return }
    if (get(isAdmin))          { navigate('/admin/solicitudes', { replace: true }); return }

    try {
      const [alumnoData, solData] = await Promise.all([
        api.alumno.me(),
        api.solicitudes.mias(),
      ])
      alumno      = alumnoData
      // Blindaje extra para evitar que Svelte truene si el backend manda un error encubierto
      solicitudes = Array.isArray(solData) ? solData : [] 
    } catch (e) {
      console.error("Error al cargar datos del dashboard:", e)
      loadError = true
    } finally {
      loading = false
    }
  })

  $: primerNombre    = alumno?.nombre?.split(' ')[0] || ''
  $: solicitudActual = solicitudes.length > 0 ? solicitudes[0] : null

  // Nota: month:'long' es intencional aquí ("1 de marzo de 2025") — formato de frase,
  // diferente al formato de tabla de formatFecha() en utils.
  $: fechaEnvio = solicitudActual?.created_at
    ? new Date(solicitudActual.created_at).toLocaleDateString('es-MX', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''
</script>

<Navbar onAlumnoClick={() => showPerfil = true} />
<PerfilModal bind:show={showPerfil} {alumno} />

<main class="main">
  {#if loading}
    <div class="loading-wrap">
      <div class="spinner-lg"></div>
    </div>
  {:else if loadError}
    <div class="content">
      <div class="card">
        <p class="error-msg">No se pudieron cargar los datos. Intenta recargar la página.</p>
      </div>
    </div>
  {:else}
    <div class="content">
      <div class="card">
        <h1 class="welcome">Bienvenida/o, {primerNombre}</h1>
        <p class="sub">Sistema de Solicitud de Becas Internas</p>

        {#if solicitudActual}
          <div class="solicitud-status">
            <div class="status-row">
              <span class="status-label">Estado de tu solicitud:</span>
              <span class={estadoBadgeClass(solicitudActual.estado)}>
                {estadoLabel(solicitudActual.estado)}
              </span>
            </div>
            <div class="status-meta">
              <span>Cuatrimestre: <strong>{solicitudActual.cuatrimestre}</strong></span>
              <span>Enviada el {fechaEnvio}</span>
            </div>
            <button
              class="btn-primary"
              style="margin-top:8px"
              on:click={() => navigate(`/solicitud/${solicitudActual.id}`)}
            >
              Ver solicitud
            </button>
          </div>
        {:else}
          <button
            class="btn-primary"
            style="margin-top:8px"
            on:click={() => navigate('/solicitud/nueva')}
          >
            Iniciar Nueva Solicitud
          </button>
        {/if}
      </div>
    </div>
  {/if}
</main>

<style>
  .main {
    padding-top: 56px;
    min-height: 100vh;
    background: var(--bg-page);
  }
  .content {
    max-width: 700px;
    margin: 0 auto;
    padding: 32px 16px;
  }
  .loading-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 56px);
  }
  .spinner-lg {
    width: 36px; height: 36px;
    border: 3px solid var(--border);
    border-top-color: var(--orange);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .card {
    background: var(--bg-card);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    padding: 36px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
  }
  .welcome { font-size: 26px; font-weight: 700; color: var(--text-primary); }
  .sub     { font-size: 14px; color: var(--text-secondary); margin-bottom: 8px; }

  .solicitud-status {
    width: 100%; max-width: 380px;
    display: flex; flex-direction: column; gap: 10px; margin-top: 8px;
  }
  .status-row {
    display: flex; align-items: center;
    justify-content: space-between; gap: 12px;
  }
  .status-label { font-size: 14px; color: var(--text-secondary); }
  .status-meta {
    display: flex; flex-direction: column; gap: 4px;
    font-size: 13px; color: var(--text-secondary); text-align: left;
  }
</style>
