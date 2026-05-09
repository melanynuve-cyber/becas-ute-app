<script>
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated, isAdmin } from '../../../lib/stores/auth.js'
  import { api } from '../../../lib/services/api.js'
  import Navbar from '../../../lib/components/Navbar.svelte'

  let solicitudes = []
  let loading = true
  let filtro = ''

  const estados = ['', 'Pendiente', 'En_revision', 'Aprobada', 'Rechazada']
  const etiquetas = {
    '':           'Todas',
    'Pendiente':  'Pendiente',
    'En_revision':'En revisión',
    'Aprobada':   'Aprobada',
    'Rechazada':  'Rechazada',
  }

  onMount(async () => {
    if (!get(isAuthenticated) || !get(isAdmin)) {
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

  async function cambiarFiltro(estado) {
    filtro = estado
    await cargar()
  }

  function badgeClass(estado) {
    const map = {
      pendiente:   'badge-pendiente',
      en_revision: 'badge-revision',
      aprobada:    'badge-aprobada',
      rechazada:   'badge-rechazada',
    }
    return `badge ${map[estado?.toLowerCase()] || ''}`
  }

  function estadoLabel(estado) {
    const map = {
      pendiente:   'Pendiente',
      en_revision: 'En revisión',
      aprobada:    'Aprobada',
      rechazada:   'Rechazada',
    }
    return map[estado?.toLowerCase()] || estado
  }

  function formatFecha(iso) {
    return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
  }
</script>

<Navbar />

<main class="main">
  <div class="content">
    <div class="page-header">
      <h1 class="page-title">Solicitudes de Beca</h1>
      <p class="page-sub">Panel de administración — Servicios Estudiantiles</p>
    </div>

    <div class="filtros">
      {#each estados as estado}
        <button
          class="filtro-btn"
          class:active={filtro === estado}
          on:click={() => cambiarFiltro(estado)}
        >
          {etiquetas[estado]}
        </button>
      {/each}
    </div>

    {#if loading}
      <div class="loading-wrap"><div class="spinner-lg"></div></div>
    {:else if solicitudes.length === 0}
      <div class="empty">No hay solicitudes {filtro ? `con estado "${etiquetas[filtro]}"` : ''}.</div>
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
            {#each solicitudes as s}
              <tr>
                <td class="td-matricula">{s.matricula}</td>
                <td>{s.cuatrimestre}</td>
                <td>{s.tipo}</td>
                <td><span class={badgeClass(s.estado)}>{estadoLabel(s.estado)}</span></td>
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
  .page-title { font-size: 24px; font-weight: 700; color: var(--text-primary); }
  .page-sub { font-size: 14px; color: var(--text-secondary); }

  .filtros {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .filtro-btn {
    padding: 7px 16px;
    border-radius: 20px;
    border: 1.5px solid var(--border);
    background: transparent;
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s;
  }
  .filtro-btn:hover { border-color: var(--orange); color: var(--orange); }
  .filtro-btn.active {
    background: var(--orange);
    border-color: var(--orange);
    color: white;
  }

  .loading-wrap {
    display: flex;
    justify-content: center;
    padding: 60px 0;
  }
  .spinner-lg {
    width: 36px; height: 36px;
    border: 3px solid var(--border);
    border-top-color: var(--orange);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .empty {
    text-align: center;
    padding: 60px 0;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .table-wrap {
    background: var(--bg-card);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    overflow: hidden;
  }
  .table {
    width: 100%;
    border-collapse: collapse;
  }
  .table thead {
    background: var(--bg-page);
    border-bottom: 1.5px solid var(--border);
  }
  .table th {
    padding: 12px 16px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .table td {
    padding: 14px 16px;
    font-size: 14px;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
  }
  .table tbody tr:last-child td { border-bottom: none; }
  .table tbody tr:hover { background: var(--bg-page); }

  .td-matricula { font-family: var(--font-mono, monospace); font-size: 13px; }

  .btn-ver {
    padding: 6px 14px;
    border-radius: 8px;
    border: 1.5px solid var(--border);
    background: transparent;
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-ver:hover {
    border-color: var(--orange);
    color: var(--orange);
  }

  :global(.badge) {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  :global(.badge-pendiente)  { background: #FEF3C7; color: #92400E; }
  :global(.badge-revision)   { background: #DBEAFE; color: #1E40AF; }
  :global(.badge-aprobada)   { background: #D1FAE5; color: #065F46; }
  :global(.badge-rechazada)  { background: #FEE2E2; color: #991B1B; }

  @media (max-width: 640px) {
    .table th:nth-child(2),
    .table td:nth-child(2),
    .table th:nth-child(5),
    .table td:nth-child(5) { display: none; }
  }
</style>