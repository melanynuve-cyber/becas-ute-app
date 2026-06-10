<script>
  // src/routes/dashboard/Dashboard.svelte
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated, isCoordinadorBecas } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'
  import PerfilModal from '../../lib/components/layout/PerfilModal.svelte'
  import LoadingSpinner from '../../lib/components/ui/LoadingSpinner.svelte'

  let alumno = null
  let loading = true
  let loadError = false
  let showPerfil = false
  let convocatoriaAbierta = false
  let mensajeConvocatoria = ''

  onMount(async () => {
    if (!get(isAuthenticated)) {
      navigate('/login', { replace: true })
      return
    }
    if (get(isCoordinadorBecas)) {
      navigate('/admin/solicitudes', { replace: true })
      return
    }

    try {
      const [alumnoData, solData] = await Promise.all([
        api.alumno.me(),
        api.solicitudes.mias(),
      ])
      alumno = alumnoData
      const solicitudes = Array.isArray(solData) ? solData : []

      // Rediseño flujo: sin beca → formulario; con beca → expediente
      if (solicitudes.length > 0) {
        navigate(`/solicitud/${solicitudes[0].id}`, { replace: true })
        return
      }

      // Verificar convocatoria antes de redirigir al formulario
      try {
        const conv = await api.admin.convocatoriaActiva()
        if (conv) {
          navigate('/solicitud/nueva', { replace: true })
          return
        }
        convocatoriaAbierta = false
        mensajeConvocatoria = conv?.mensaje || 'Las solicitudes de beca no están disponibles en este momento.'
      } catch {
        mensajeConvocatoria = 'No se pudo verificar el estado de la convocatoria.'
      }
    } catch (e) {
      loadError = true
    } finally {
      loading = false
    }
  })

  $: primerNombre = alumno?.nombre?.split(' ')[0] || ''
</script>

<svelte:head>
  <title>Dashboard | Becas UTE</title>
</svelte:head>

<Navbar onAlumnoClick={() => showPerfil = true} />
<PerfilModal bind:show={showPerfil} {alumno} />

<main class="main">
  {#if loading}
    <div style="height: calc(100vh - 56px); display: flex; align-items: center; justify-content: center;">
      <LoadingSpinner />
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
          <h1 class="welcome">Bienvenida/o, {primerNombre}</h1>
          <p class="sub">Panel de control de Becas Internas y Modalidad Dual</p>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="card-base tracking-card">
          <div class="card-header">
            <h2 class="section-title">Beca Interna</h2>
          </div>
          <div class="empty-state">
            <div class="convocatoria-aviso">
              <svg width="40" height="40" fill="none" stroke="var(--text-disabled)" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p>{mensajeConvocatoria || 'Las solicitudes de beca no están disponibles en este momento.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  .main { padding-top: 56px; min-height: 100vh; background: var(--bg-page); }
  .content { max-width: 960px; margin: 0 auto; padding: 40px 24px; display: flex; flex-direction: column; gap: 24px; }
  .welcome-banner { background: linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(249,115,22,0.02) 100%); border: 1px solid rgba(249,115,22,0.12); border-radius: var(--radius-card); padding: 28px 32px; }
  .welcome { font-size: 24px; font-weight: 700; color: var(--text-primary); margin: 0; }
  .sub { font-size: 14px; color: var(--text-secondary); margin: 4px 0 0; }
  .dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
  .card-base { background: var(--bg-card); border-radius: var(--radius-card); border: 1px solid var(--border); box-shadow: var(--shadow-card); padding: 28px; }
  .card-header { margin-bottom: 16px; }
  .section-title { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0; }
  .empty-state { display: flex; flex-direction: column; align-items: center; padding: 20px 0; }
  .convocatoria-aviso { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
  .convocatoria-aviso p { font-size: 15px; color: var(--text-secondary); max-width: 400px; line-height: 1.6; margin: 0; }
  .error-msg { font-size: 14px; color: var(--error); }

  @media (max-width: 768px) {
    .content { padding: 24px 16px; }
    .welcome-banner { padding: 20px 24px; }
    .welcome { font-size: 20px; }
    .card-base { padding: 20px; }
  }
</style>
