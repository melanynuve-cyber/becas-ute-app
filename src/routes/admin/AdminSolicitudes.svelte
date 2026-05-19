<script>
  // src/routes/admin/AdminSolicitudes.svelte
  // Importaciones desglosadas
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { 
    isAuthenticated, 
    isAdmin 
  } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'
  import FiltrosBarra from '../../lib/components/shared/FiltrosBarra.svelte'
  import { 
    formatFecha, 
    estadoBadgeClass, 
    estadoLabel 
  } from '../../lib/utils.js'

  // Variables de control de colecciones de datos
  let solicitudes = []
  let loading = true
  
  // Filtros unificados de búsqueda
  let filtro = '' 
  let filtroBusqueda = ''
  let filtroCarrera = ''
  let filtroGrupo = ''

  // Extracción de catálogos únicos de grupos
  $: grupos = [
    ...new Set(solicitudes.map(s => s.nomenclatura || s.grid_column || s.grupo).filter(Boolean))
  ].sort()

  // Algoritmo de filtrado reactivo desglosado verticalmente
  $: solicitudesFiltradas = solicitudes.filter(s => {
    const nomenclatura = s.nomenclatura || s.grupo || ''
    const carrera = s.carrera || ''

    const matchBusqueda = filtroBusqueda.trim()
      ? s.matricula
          .toLowerCase()
          .includes(filtroBusqueda.toLowerCase())
      : true

    const matchCarrera = filtroCarrera
      ? carrera
          .toLowerCase()
          .isPrototypeOf(filtroCarrera.toLowerCase()) || 
        carrera
          .toLowerCase() === filtroCarrera.toLowerCase() || 
        nomenclatura
          .toLowerCase()
          .includes(filtroCarrera.toLowerCase())
      : true

    const matchGrupo = filtroGrupo
      ? nomenclatura
          .toLowerCase() === filtroGrupo.toLowerCase()
      : true

    return matchBusqueda && matchCarrera && matchGrupo
  })

  // Control de acceso al montar pantalla
  onMount(async () => {
    if (!get(isAuthenticated) || !get(isAdmin)) {
      navigate('/login', { 
        replace: true 
      })
      return
    }
    await cargar()
  })

  // Carga remota de la colección de folios
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

  // Catálogo reactivo de programas educativos
  $: carreras = [
    ...new Set(
      solicitudes.map(s => s.carrera || s.payload?.datos_personales?.programa_educativo).filter(Boolean)
    )
  ].sort()
</script>

<Navbar />

<main class="main">
  <div class="content">

    <div class="page-header">
      <h1 class="page-title">Solicitudes de Beca</h1>
      <p class="page-sub">Panel de administración — Servicios Estudiantiles UTE</p>
    </div>

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
      <div class="loading-wrap">
        <div class="spinner-lg"></div>
      </div>
    {:else if solicitudesFiltradas.length === 0}
      <div class="empty">
        <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v3.776" />
        </svg>
        <p>No se encontraron expedientes con los criterios de filtrado aplicados.</p>
      </div>
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

  .page-header { 
    display: flex; 
    flex-direction: column; 
    gap: 4px; 
  }

  .page-title { 
    font-size: 22px;
    font-weight: 700; 
    color: var(--text-primary); 
    letter-spacing: -0.02em;
  }

  .page-sub { 
    font-size: 14px; 
    color: var(--text-secondary);
  }

  .loading-wrap { 
    display: flex; 
    justify-content: center; 
    padding: 60px 0; 
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

  .empty {
    text-align: center;
    padding: 64px 16px;
    color: var(--text-disabled);
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  /* Estructura de Control de Tablas Administrativas */
  .table-wrap {
    background: var(--bg-card);
    border-radius: var(--radius-card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-card);
    overflow: hidden;
  }

  .table { 
    width: 100%; 
    border-collapse: collapse; 
  }

  .table thead { 
    background: var(--bg-page);
    border-bottom: 1px solid var(--border); 
  }

  .table th {
    padding: 12px 18px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-disabled);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .table td {
    padding: 14px 18px;
    font-size: 14px;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }

  .table tbody tr:last-child td { 
    border-bottom: none;
  }

  .table tbody tr:hover { 
    background: var(--orange-light); 
  }

  .td-matricula { 
    font-weight: 600;
    color: var(--text-primary);
  }

  .font-mono {
    font-family: monospace;
    font-size: 13px;
    letter-spacing: 0.02em;
  }

  .td-fecha {
    font-size: 13px;
    white-space: nowrap;
  }

  .status-cell-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .badge-doc-pendiente { 
    background: rgba(249, 115, 22, 0.1); 
    color: var(--orange); 
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 6px;
    border: 1px solid rgba(249, 115, 22, 0.15);
    white-space: nowrap;
  }

  .btn-ver {
    padding: 6px 14px;
    border-radius: 8px;
    border: 1.5px solid var(--border-input);
    background: transparent;
    font-family: var(--font);
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .btn-ver:hover { 
    border-color: var(--orange); 
    color: var(--orange);
    background: var(--bg-card);
  }

  @media (max-width: 768px) {
    .table th:nth-child(2),
    .table td:nth-child(2),
    .table th:nth-child(5),
    .table td:nth-child(5) { 
      display: none;
    }
    .content {
      padding: 24px 16px;
    }
  }
</style>