<script>
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated, isAdmin, user } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/Navbar.svelte'

  let alumno = null
  let solicitudes = []
  let loading = true
  let showPerfil = false

  // Guard
  onMount(async () => {
    if (!get(isAuthenticated)) { navigate('/login', { replace: true }); return }
    if (get(isAdmin))          { navigate('/admin/solicitudes', { replace: true }); return }

    try {
      const [alumnoData, solData] = await Promise.all([
        api.alumno.me(),
        api.solicitudes.mias()
      ])
      alumno = alumnoData
      solicitudes = solData
    } catch (e) {
      console.error(e)
    } finally {
      loading = false
    }
  })

  $: primerNombre = alumno?.nombre?.split(' ')[0] || ''
  $: solicitudActual = solicitudes[0] || null

  function estadoBadgeClass(estado) {
    return `badge badge-${estado?.toLowerCase().replace(' ', '_')}`
  }

  function estadoLabel(estado) {
    const map = {
      pendiente: 'Pendiente',
      en_revision: 'En revisión',
      aprobada: 'Aprobada',
      rechazada: 'Rechazada'
    }
    return map[estado?.toLowerCase()] || estado
  }
</script>

<Navbar onAlumnoClick={() => showPerfil = true} />

<main class="main">
  {#if loading}
    <div class="loading-wrap">
      <div class="spinner-lg"></div>
    </div>
  {:else}
    <div class="content">

      <!-- Card principal -->
      <div class="card">
        <h1 class="welcome">Bienvenida/o, {primerNombre}</h1>
        <p class="sub">Sistema de Solicitud de Becas Internas</p>

        {#if solicitudActual}
          <!-- Ya tiene solicitud -->
          <div class="solicitud-status">
            <div class="status-row">
              <span class="status-label">Estado de tu solicitud:</span>
              <span class={estadoBadgeClass(solicitudActual.estado)}>
                {estadoLabel(solicitudActual.estado)}
              </span>
            </div>
            <div class="status-meta">
              <span>Cuatrimestre: <strong>{solicitudActual.cuatrimestre}</strong></span>
              <span>Enviada el {new Date(solicitudActual.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <button class="btn-primary" style="margin-top:8px" on:click={() => navigate(`/solicitud/${solicitudActual.id}`)}>
              Ver solicitud
            </button>
          </div>
        {:else}
          <!-- Sin solicitud -->
          <button class="btn-primary" style="margin-top:8px" on:click={() => navigate('/solicitud/nueva')}>
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

  .welcome {
    font-size: 26px;
    font-weight: 700;
    color: var(--text-primary);
  }
  .sub {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .solicitud-status {
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 8px;
  }
  .status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .status-label { font-size: 14px; color: var(--text-secondary); }
  .status-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: var(--text-secondary);
    text-align: left;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    backdrop-filter: blur(2px);
  }
  .modal-card {
    background: var(--bg-card);
    border-radius: var(--radius-card);
    box-shadow: 0 8px 40px rgba(0,0,0,0.15);
    padding: 28px;
    width: 100%;
    max-width: 420px;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .modal-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .avatar {
    width: 52px;
    height: 52px;
    background: var(--orange);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .modal-title   { font-size: 17px; font-weight: 700; }
  .modal-subtitle{ font-size: 13px; color: var(--text-secondary); }

  .modal-fields { display: flex; flex-direction: column; gap: 10px; }
  .field-card {
    background: var(--bg-page);
    border-radius: 10px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .field-card.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }
  .field-card.two-col > div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .field-label { font-size: 11px; color: var(--text-secondary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
  .field-value  { font-size: 14px; font-weight: 600; color: var(--text-primary); }

  .modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: var(--bg-page);
    border: none;
    border-radius: 8px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);
    transition: background 0.15s;
  }
  .modal-close:hover { background: var(--border); }
</style>
