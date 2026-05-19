<script>
  // src/routes/dashboard/Dashboard.svelte
  // Importaciones
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated, isAdmin } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'
  import PerfilModal from '../../lib/components/layout/PerfilModal.svelte'
  import { estadoBadgeClass, estadoLabel } from '../../lib/utils.js'

  // Variables de estado
  let alumno      = null
  let solicitudes = []
  let loading     = true
  let loadError   = false
  let showPerfil  = false

  // Carga inicial
  onMount(async () => {
    if (!get(isAuthenticated)) { 
      navigate('/login', { replace: true })
      return 
    }
    if (get(isAdmin)) { 
      navigate('/admin/solicitudes', { replace: true })
      return 
    }

    try {
      const [alumnoData, solData] = await Promise.all([
        api.alumno.me(),
        api.solicitudes.mias(),
      ])
    
      alumno      = alumnoData      
      // Validación de estructura de respuesta
      solicitudes = Array.isArray(solData) ? solData : [] 
    } catch (e) {
      console.error("Error al cargar datos del dashboard:", e)
      loadError = true
    } finally {
      loading = false
    }
  })

  // Variables reactivas
  $: primerNombre    = alumno?.nombre?.split(' ')[0] || ''
  $: solicitudActual = solicitudes.length > 0 ? solicitudes[0] : null

  // Formato de fecha en texto largo
  $: fechaEnvio = solicitudActual?.created_at
    ? new Date(solicitudActual.created_at).toLocaleDateString('es-MX', {
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
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
      <div class="card-base">
        <p class="error-msg">No se pudieron cargar los datos. Intenta recargar la página.</p>
      </div>
    </div>
  {:else}
    <div class="content">
      
      <div class="welcome-banner">
        <div class="welcome-text">
          <h1 class="welcome">Bienvenida/o de nuevo, {primerNombre}</h1>
          <p class="sub">Panel de control de Becas Internas y Modalidad Dual</p>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="card-base tracking-card">
          <div class="card-header">
            <h2 class="section-title">Estatus de Trámite Activo</h2>
          </div>

          {#if solicitudActual}
            <div class="solicitud-status">
              <div class="status-row">
                <span class="status-label">Solicitud de Beca Interna</span>
                <span class={estadoBadgeClass(solicitudActual.estado)}>
                  {estadoLabel(solicitudActual.estado)}
                </span>
              </div>
              
              <div class="status-divider"></div>

              <div class="status-meta">
                <div class="meta-item">
                  <span class="meta-label">Periodo</span>
                  <span class="meta-value">{solicitudActual.cuatrimestre}° Cuatrimestre</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Fecha de Envío</span>
                  <span class="meta-value">{fechaEnvio}</span>
                </div>
              </div>

              <button
                class="btn-primary"
                style="margin-top: 12px"
                on:click={() => navigate(`/solicitud/${solicitudActual.id}`)}
              >
                Revisar Expediente
              </button>
            </div>
          {:else}
            <div class="empty-state">
              <p class="empty-text">No cuentas con ninguna solicitud activa en este cuatrimestre.</p>
              <button
                class="btn-primary"
                on:click={() => navigate('/solicitud/nueva')}
              >
                Iniciar Nueva Solicitud
              </button>
            </div>
          {/if}
        </div>
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
  
  /* Contenedor alineado a la izquierda */
  .content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  /* Banner Hero */
  .welcome-banner {
    background: linear-gradient(135deg, var(--orange-light) 0%, rgba(255,255,255,0) 100%);
    border-left: 4px solid var(--orange);
    padding: 24px 32px;
    border-radius: var(--radius-card);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  :global([data-theme="dark"]) .welcome-banner {
    background: linear-gradient(135deg, var(--orange-light) 0%, rgba(21,29,48,0) 100%);
  }

  .welcome {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  .sub {
    font-size: 14px;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  /* Estructura de Tarjeta */
  .card-base {
    background: var(--bg-card);
    border-radius: var(--radius-card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-card);
    padding: 28px;
  }
  
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  @media (min-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 1.5fr;
    }
  }

  .card-header {
    border-bottom: 1px solid var(--border);
    padding-bottom: 16px;
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .solicitud-status {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .status-label {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .status-divider {
    height: 1px;
    background: var(--border);
    width: 100%;
  }

  .status-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .meta-label {
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--text-disabled);
    letter-spacing: 0.05em;
  }

  .meta-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .empty-state {
    padding: 20px 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .empty-text {
    font-size: 14px;
    color: var(--text-secondary);
  }

  /* Loader */
  .loading-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 56px);
  }

  .spinner-lg {
    width: 32px;
    height: 32px;
    border: 3px solid var(--border);
    border-top-color: var(--orange);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>