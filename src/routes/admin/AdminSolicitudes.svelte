<script>
  // src/routes/admin/AdminSolicitudes.svelte
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated, isCoordinadorBecas } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'
  import FiltrosBarra from '../../lib/components/shared/FiltrosBarra.svelte'
  import PageHeader from '../../lib/components/ui/PageHeader.svelte'
  import LoadingSpinner from '../../lib/components/ui/LoadingSpinner.svelte'
  import EmptyState from '../../lib/components/ui/EmptyState.svelte'
  import { formatFecha, estadoBadgeClass, estadoLabel } from '../../lib/utils.js'

  let solicitudes = []
  let loading = true
  
  let filtro = '' 
  let filtroBusqueda = ''
  let filtroCarrera = ''
  let filtroGrupo = ''

  $: grupos = [
    ...new Set(solicitudes.map(s => s.nomenclatura || s.grid_column || s.grupo).filter(Boolean))
  ].sort()

  $: solicitudesFiltradas = solicitudes.filter(s => {
    const nomenclatura = s.nomenclatura || s.grupo || ''
    const carrera = s.carrera || ''

    const matchBusqueda = filtroBusqueda.trim()
      ? s.matricula.toLowerCase().includes(filtroBusqueda.toLowerCase())
      : true

    const matchCarrera = filtroCarrera
      ? carrera.toLowerCase().isPrototypeOf(filtroCarrera.toLowerCase()) ||
        carrera.toLowerCase() === filtroCarrera.toLowerCase() ||
        nomenclatura.toLowerCase().includes(filtroCarrera.toLowerCase())
      : true

    const matchGrupo = filtroGrupo
      ? nomenclatura.toLowerCase() === filtroGrupo.toLowerCase()
      : true

    return matchBusqueda && matchCarrera && matchGrupo
  })

  onMount(async () => {
    if (!get(isAuthenticated) || !get(isCoordinadorBecas)) {
      navigate('/login', { replace: true })
      return
    }
    await cargar()
  })

  async function cargar() {
    loading = true
    try {
      solicitudes = await api.admin.lista(filtro)
    } catch (e) {
      console.error(e)
    } finally {
      loading = false
    }
  }

  $: carreras = [
    ...new Set(
      solicitudes.map(s => s.carrera || s.payload?.datos_personales?.programa_educativo).filter(Boolean)
    )
  ].sort()
</script>

<Navbar />

<main class="main">
  <div class="content">

    <PageHeader 
      title="Solicitudes de Beca" 
      subtitle="Panel de administración — Servicios Estudiantiles UTE" 
    />

    <FiltrosBarra
      mostrarCarrera={true}
      mostrarGrupo={true}
      mostrarEstado={true}
      {grupos}
      {carreras}
      bind:filtroEstado={filtro}
      bind:filtroBusqueda
      bind:filtroCarrera
      bind:filtroGrupo
      on:buscar={cargar}
    />

    {#if loading}
      <LoadingSpinner />
    {:else if solicitudesFiltradas.length === 0}
      <EmptyState message="No se encontraron expedientes con los criterios de filtrado aplicados." />
    {:else}
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Cuatrimestre</th>
              <th>Tipo de Trámite</th>
              <th>Estado</th>
              <th>Fecha de Envío</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each solicitudesFiltradas as s}
              <tr>
                <td class="td-matricula font-mono">{s.matricula}</td>
                <td>{s.cuatrimestre}° Cuatrimestre</td>
                <td style="font-weight: 500;">{s.tipo}</td>
                <td>
                  <div class="status-cell-container">
                    <span class={estadoBadgeClass(s.estado)}>
                      {estadoLabel(s.estado)}
                    </span>
                    {#if s.documentos?.recibo_inscripcion === 'pendiente'}
                       <span class="badge-doc-pendiente">Inscripción Pendiente</span>
                    {/if}
                  </div>
                </td>
                <td class="td-fecha">{formatFecha(s.created_at)}</td>
                <td style="text-align: right;">
                  <button class="btn-ver" on:click={() => navigate(`/admin/solicitudes/${s.id}`)}>
                    Ver expediente
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

  </div>
</main>

<style>
  .main {
    padding-top: 56px;
    min-height: 100vh;
    background: var(--bg-page);
  }

  .content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Estructura de Control de Tablas Administrativas */
  .table-wrap {
    background: var(--bg-card);
    border-radius: var(--radius-card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-card);
    overflow: hidden;
  }

  .table { width: 100%; border-collapse: collapse; }
  .table thead { background: var(--bg-page); border-bottom: 1px solid var(--border); }
  
  .table th {
    padding: 12px 18px; text-align: left; font-size: 11px;
    font-weight: 600; color: var(--text-disabled);
    text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap;
  }

  .table td {
    padding: 14px 18px; font-size: 14px; color: var(--text-secondary);
    border-bottom: 1px solid var(--border); vertical-align: middle;
  }

  .table tbody tr:last-child td { border-bottom: none; }
  .table tbody tr:hover { background: var(--orange-light); }

  .td-matricula { font-weight: 600; color: var(--text-primary); }
  .font-mono { font-family: monospace; font-size: 13px; letter-spacing: 0.02em; }
  .td-fecha { font-size: 13px; white-space: nowrap; }

  .status-cell-container { display: flex; align-items: center; gap: 8px; }

  .badge-doc-pendiente { 
    background: rgba(249, 115, 22, 0.1); color: var(--orange);
    font-size: 11px; font-weight: 600; padding: 2px 8px;
    border-radius: 6px; border: 1px solid rgba(249, 115, 22, 0.15); white-space: nowrap;
  }

  .btn-ver {
    padding: 6px 14px; border-radius: 8px; border: 1.5px solid var(--border-input);
    background: transparent; font-family: var(--font); font-size: 13px;
    font-weight: 600; color: var(--text-primary); cursor: pointer;
    transition: all 0.2s ease; white-space: nowrap;
  }

  .btn-ver:hover { border-color: var(--orange); color: var(--orange); background: var(--bg-card); }

  @media (max-width: 768px) {
    .table th:nth-child(2), .table td:nth-child(2),
    .table th:nth-child(5), .table td:nth-child(5) { display: none; }
    .content { padding: 24px 16px; }
  }
</style>