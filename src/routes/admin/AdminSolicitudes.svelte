<script>
  // src/routes/admin/AdminSolicitudes.svelte
  // Importación de librerías globales y componentes comunes de la app
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated, isAdmin } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'
  import FiltrosBarra from '../../lib/components/shared/FiltrosBarra.svelte'
  import { formatFecha, estadoBadgeClass, estadoLabel } from '../../lib/utils.js'

  // Estados locales para el almacenamiento de registros y carga
  let solicitudes = []
  let loading = true
  
  // Variables unificadas para el control de los filtros de búsqueda
  let filtro = '' 
  let filtroBusqueda = ''
  let filtroCarrera = ''
  let filtroGrupo = ''

  // Extracción reactiva de grupos institucionales únicos
  $: grupos = [...new Set(solicitudes.map(s => s.nomenclatura || s.grupo).filter(Boolean))].sort();

  // Algoritmo reactivo para el filtrado multidimensional en el cliente
  $: solicitudesFiltradas = solicitudes.filter(s => {
    const nomenclatura = s.nomenclatura || s.grupo || '';
    const carrera = s.carrera || '';

    const matchBusqueda = filtroBusqueda.trim()
      ? s.matricula.toLowerCase().includes(filtroBusqueda.toLowerCase())
      : true;

    const matchCarrera = filtroCarrera
      ? carrera.toLowerCase() === filtroCarrera.toLowerCase() || nomenclatura.toLowerCase().includes(filtroCarrera.toLowerCase())
      : true;

    const matchGrupo = filtroGrupo
      ? nomenclatura.toLowerCase() === filtroGrupo.toLowerCase()
      : true;

    return matchBusqueda && matchCarrera && matchGrupo;
  });

  // Verificación de autenticación al inicializar la pantalla
  onMount(async () => {
    if (!get(isAuthenticated) || !get(isAdmin)) {
      navigate('/login', { replace: true })
      return
    }
    await cargar()
  })

  // Consulta de la lista completa de solicitudes vigentes
  async function cargar() {
    loading = true
    try {
      solicitudes = await api.admin.lista(filtro)
    } catch {
    } finally {
      loading = false
    }
  }

  $: carreras = [...new Set(solicitudes.map(s => s.carrera || s.payload?.datos_personales?.programa_educativo).filter(Boolean))].sort();

</script>

<Navbar />

<main class="main">
  <div class="content">

    <div class="page-header">
      <h1 class="page-title">Solicitudes de Beca</h1>
      <p class="page-sub">Panel de administración — Servicios Estudiantiles</p>
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
      <div class="loading-wrap"><div class="spinner-lg"></div></div>
    {:else if solicitudesFiltradas.length === 0}
      <div class="empty">
        No hay solicitudes con los filtros aplicados.
      </div>
    {:else}
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Cuatrimestre</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each solicitudesFiltradas as s}
              <tr>
                <td class="td-matricula">{s.matricula}</td>
                <td>{s.cuatrimestre}</td>
                <td>{s.tipo}</td>
                <td>
                  <span class={estadoBadgeClass(s.estado)}>{estadoLabel(s.estado)}</span>
                  {#if s.documentos?.recibo_inscripcion === 'pendiente'}
                    <span class="badge badge-doc-pendiente">Doc. pendiente</span>
                  {/if}
                </td>
                <td>{formatFecha(s.created_at)}</td>
                <td>
                  <button class="btn-ver" on:click={() => navigate(`/admin/solicitudes/${s.id}`)}>
                    Ver detalle
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
    padding: 32px 16px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .page-header { display: flex; flex-direction: column; gap: 4px; }
  .page-title  { font-size: 24px; font-weight: 700; color: var(--text-primary); }
  .page-sub    { font-size: 14px; color: var(--text-secondary); }

  .loading-wrap { display: flex; justify-content: center; padding: 60px 0; }
  .spinner-lg {
    width: 36px; height: 36px;
    border: 3px solid var(--border);
    border-top-color: var(--orange);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .empty {
    text-align: center; padding: 60px 0;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .table-wrap {
    background: var(--bg-card);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card); overflow: hidden;
  }
  .table { width: 100%; border-collapse: collapse; }
  .table thead { background: var(--bg-page); border-bottom: 1.5px solid var(--border); }
  .table th {
    padding: 12px 16px;
    text-align: left;
    font-size: 12px; font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .table td {
    padding: 14px 16px; font-size: 14px;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
  }
  .table tbody tr:last-child td { border-bottom: none; }
  .table tbody tr:hover { background: var(--bg-page); }

  .td-matricula { font-family: var(--font-mono, monospace); font-size: 13px; }

  :global(.badge-doc-pendiente) { background: #FEF3C7; color: #92400E; margin-left: 6px; }

  .btn-ver {
    padding: 6px 14px; border-radius: 8px;
    border: 1.5px solid var(--border);
    background: transparent;
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer; transition: all 0.15s;
  }
  .btn-ver:hover { border-color: var(--orange); color: var(--orange); }

  @media (max-width: 640px) {
    .table th:nth-child(2),
    .table td:nth-child(2),
    .table th:nth-child(5),
    .table td:nth-child(5) { display: none; }
  }
</style>