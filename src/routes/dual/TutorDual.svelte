<script>
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated, isTutor } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/Navbar.svelte'
  import { formatFecha } from '../../lib/utils.js'

  // ── Vistas ─────────────────────────────────────────────────────────────────
  let vista = 'directorio'   // 'directorio' | 'expediente'

  // ── Directorio ─────────────────────────────────────────────────────────────
  let alumnos            = []
  let loading            = true
  let error              = ''
  let filtroCuatrimestre = ''
  let filtroGrupo        = ''
  let filtroBusqueda     = ''

  // ── Expediente ─────────────────────────────────────────────────────────────
  let alumnoSeleccionado  = null
  let reportes            = []
  let loadingExpediente   = false
  let errorExpediente     = ''

  // ── Guard ──────────────────────────────────────────────────────────────────
  onMount(async () => {
    if (!get(isAuthenticated) || !get(isTutor)) {
      navigate('/login', { replace: true })
      return
    }
    await cargarAlumnos()
  })

  // ── Directorio ─────────────────────────────────────────────────────────────
  async function cargarAlumnos() {
    loading = true
    error   = ''
    try {
      const params = new URLSearchParams()
      if (filtroCuatrimestre) params.append('cuatrimestre', filtroCuatrimestre)
      if (filtroGrupo)        params.append('grupo',        filtroGrupo)
      alumnos = await api.dual.listarAlumnos(params.toString())
    } catch (e) {
      error = e.message || 'Error al cargar alumnos.'
    } finally {
      loading = false
    }
  }

  // Lista de grupos únicos para el select de filtro
  $: grupos = [...new Set(alumnos.map(a => a.nomenclatura).filter(Boolean))].sort()

  // Filtro de búsqueda por matrícula o nombre (client-side)
  $: alumnosFiltrados = filtroBusqueda.trim()
    ? alumnos.filter(a =>
        a.matricula.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
        a.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase())
      )
    : alumnos

  // ── Expediente ─────────────────────────────────────────────────────────────
  async function abrirExpediente(alumno) {
    alumnoSeleccionado = alumno
    reportes           = []
    errorExpediente    = ''
    loadingExpediente  = true
    vista              = 'expediente'
    
    try {
      reportes = await api.dual.expediente(alumno.matricula, filtroCuatrimestre || null)
    } catch (e) {
      errorExpediente = e.message || 'Error al cargar el expediente.'
    } finally {
      loadingExpediente = false
    }
  }

  function volverDirectorio() {
    alumnoSeleccionado = null
    reportes           = []
    vista              = 'directorio'
  }

  // ── Exportar CSV ───────────────────────────────────────────────────────────
  function descargarCSV(matricula) {
    const params = filtroCuatrimestre ? `?cuatrimestre=${filtroCuatrimestre}` : ''
    const url    = api.dual.exportarCSV(matricula) + params
    window.open(url, '_blank')
  }

// ── Promedio visual ────────────────────────────────────────────────────────
  $: promedioExpediente = reportes.length
    ? (reportes.reduce((s, r) => s + Number(r.calificacion_alumno), 0) / reportes.length).toFixed(2)
    : null

// Diccionario para mapear el nombre largo de la carrera
  const nombresCarreras = {
    "TII": "Ingeniería en Tecnologías de la Información e Innovación Digital"
  };

  $: carreraCompletaExpediente = alumnoSeleccionado ? (nombresCarreras[alumnoSeleccionado.carrera] || alumnoSeleccionado.carrera) : '—';

</script>

<Navbar />

<div class="main-content">

  {#if vista === 'directorio'}
    <div class="page-wrap">
      <div class="page-header">
        <h1 class="page-title">Alumnos Duales</h1>
        <p class="page-sub">Directorio del cuatrimestre en curso</p>
      </div>

      <div class="filters-row">
        <input
          class="input-plain input-busqueda"
          placeholder="Buscar por nombre o matrícula…"
          bind:value={filtroBusqueda}
        />
        <input
          class="input-plain"
          placeholder="Cuatrimestre (ej. 5)"
          bind:value={filtroCuatrimestre}
          style="max-width:180px"
          on:keydown={(e) => e.key === 'Enter' && cargarAlumnos()}
        />
        <select
          bind:value={filtroGrupo}
          class="input-plain"
          style="min-width:180px"
          on:change={cargarAlumnos}
        >
          <option value="">Todos los grupos</option>
          {#each grupos as g}
            <option value={g}>{g}</option>
          {/each}
        </select>
        <button class="btn-outline" on:click={cargarAlumnos}>Buscar</button>
      </div>

      {#if loading}
        <div class="state-msg"><div class="spinner"></div></div>
      {:else if error}
        <p class="error-msg">{error}</p>
      {:else if alumnosFiltrados.length === 0}
        <div class="state-msg empty">
          <span class="empty-icon">👥</span>
          <p>No hay alumnos duales con los filtros seleccionados.</p>
        </div>
      {:else}
        <div class="table-wrap">
          <table class="tabla">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Nombre</th>
                <th>Grupo</th>
                <th>Empresa</th>
                <th>Reportes</th>
                <th>Promedio</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {#each alumnosFiltrados as a}
                <tr>
                  <td class="td-matricula">{a.matricula}</td>
                  <td class="td-nombre">{a.nombre}</td>
                  <td class="td-grupo">{a.nomenclatura || '—'}</td>
                  <td>
                    {#if a.empresa}
                      {a.empresa}
                    {:else}
                      <span class="text-secondary">Sin asignar</span>
                    {/if}
                  </td>
                  <td class="td-center">
                    <span class="chip-reportes">{a.reportes_aprobados ?? 0}</span>
                  </td>
                  <td class="td-center td-promedio">
                    {a.promedio ?? '—'}
                  </td>
                  <td>
                    <button class="btn-ver" on:click={() => abrirExpediente(a)}>
                      Ver expediente →
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <p class="count-label">{alumnosFiltrados.length} alumno{alumnosFiltrados.length !== 1 ? 's' : ''}</p>
      {/if}
    </div>

  {:else if vista === 'expediente' && alumnoSeleccionado}
    <div class="page-wrap">

      <div class="expediente-topbar">
        <button class="btn-back" on:click={volverDirectorio}>← Volver al directorio</button>
      </div>

      <div class="expediente-layout">

        <div class="ficha-card">
          <p class="ficha-titulo">Datos del alumno</p>
          <div class="ficha-grid">
            <span class="ficha-key">Nombre</span>
            <span class="ficha-val">{alumnoSeleccionado.nombre}</span>
            <span class="ficha-key">Matrícula</span>
            <span class="ficha-val ficha-mono">{alumnoSeleccionado.matricula}</span>
            <span class="ficha-key">Carrera</span>
            <span class="ficha-val">{carreraCompletaExpediente}</span>
            <span class="ficha-key">Grupo</span>
            <span class="ficha-val">{alumnoSeleccionado.nomenclatura || '—'}</span>
            <span class="ficha-key">Empresa</span>
            <span class="ficha-val">{alumnoSeleccionado.empresa || 'Sin asignar'}</span>
            <span class="ficha-key">Turno</span>
            <span class="ficha-val">{alumnoSeleccionado.turno || '—'}</span>
          </div>

          {#if promedioExpediente}
            <div class="promedio-box">
              <p class="promedio-label">Promedio del cuatrimestre</p>
              <p class="promedio-valor">{promedioExpediente}</p>
            </div>
          {/if}

          <div class="ficha-acciones">
            <button
              class="btn-primary"
              style="width:100%"
              on:click={() => descargarCSV(alumnoSeleccionado.matricula)}
            >
              ↓ Exportar CSV
            </button>
            <button
              class="btn-outline"
              style="width:100%"
              disabled
              title="Próximamente"
            >
              ↓ Descargar todos los PDFs
            </button>
          </div>
        </div>

        <div class="reportes-card">
          <h2 class="card-title">Reportes aprobados</h2>

          {#if loadingExpediente}
            <div class="state-msg"><div class="spinner"></div></div>
          {:else if errorExpediente}
            <p class="error-msg">{errorExpediente}</p>
          {:else if reportes.length === 0}
            <div class="state-msg empty">
              <span class="empty-icon">📭</span>
              <p>Este alumno no tiene reportes aprobados aún.</p>
            </div>
          {:else}
            <div class="table-wrap">
              <table class="tabla">
                <thead>
                  <tr>
                    <th>Semana</th>
                    <th>Calificación</th>
                    <th>Entregado</th>
                    <th>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {#each reportes as r}
                    <tr>
                      <td class="td-center"><strong>Semana {r.semana}</strong></td>
                      <td class="td-cal">{r.calificacion_alumno}</td>
                      <td class="td-fecha">{formatFecha(r.created_at)}</td>
                      <td>
                        {#if r.archivo_pdf_url}
                          <a
                            href={r.archivo_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn-pdf"
                          >
                            Ver PDF ↗
                          </a>
                        {:else}
                          <span class="text-secondary">—</span>
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            <p class="count-label">{reportes.length} reporte{reportes.length !== 1 ? 's' : ''} aprobado{reportes.length !== 1 ? 's' : ''}</p>
          {/if}
        </div>

      </div>
    </div>
  {/if}

</div>

<style>
  .main-content { padding-top: 56px; }
  .page-wrap    { padding: 2rem 1.5rem; max-width: 1100px; margin: 0 auto; }
  .page-header  { margin-bottom: 1.5rem; }
  .page-title   { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
  .page-sub     { font-size: 0.875rem; color: var(--text-secondary); margin: 0; }

  /* ── Filtros ─────────────────────────────────────────────────────────────── */
  .filters-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 1.5rem; }
  .input-busqueda { flex: 1; min-width: 200px; }

  /* ── Tabla ───────────────────────────────────────────────────────────────── */
  .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-card); background: var(--bg-card); }
  .tabla { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  .tabla thead { background: var(--bg-page); }
  .tabla th { text-align: left; padding: 10px 16px; font-weight: 600; color: var(--text-secondary); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); white-space: nowrap; }
  .tabla td { padding: 13px 16px; color: var(--text-primary); border-bottom: 1px solid var(--border); }
  .tabla tbody tr:last-child td { border-bottom: none; }
  .tabla tbody tr:hover         { background: var(--orange-light); }

  .td-matricula  { font-family: monospace; font-weight: 600; letter-spacing: 0.03em; white-space: nowrap; }
  .td-nombre     { font-weight: 500; }
  .td-grupo      { font-family: monospace; font-size: 0.82rem; color: var(--text-secondary); }
  .td-center     { text-align: center; }
  .td-cal        { font-weight: 700; color: var(--orange); font-size: 1rem; text-align: center; }
  .td-fecha      { color: var(--text-secondary); font-size: 0.82rem; white-space: nowrap; }
  .td-promedio   { font-weight: 700; color: var(--text-primary); }
  .text-secondary { color: var(--text-secondary); }

  .chip-reportes { display: inline-block; background: var(--orange-light); color: var(--orange); font-weight: 700; font-size: 0.82rem; border-radius: 20px; padding: 2px 10px; border: 1px solid #FED7AA; }
  .btn-ver { background: none; border: 1px solid var(--border); border-radius: 8px; padding: 5px 14px; font-size: 0.82rem; font-weight: 600; color: var(--orange); cursor: pointer; white-space: nowrap; transition: background 0.15s, border-color 0.15s; }
  .btn-ver:hover { background: var(--orange-light); border-color: var(--orange); }

  .btn-pdf { display: inline-block; background: none; border: 1px solid var(--border); border-radius: 8px; padding: 5px 12px; font-size: 0.82rem; font-weight: 600; color: var(--orange); text-decoration: none; white-space: nowrap; transition: background 0.15s, border-color 0.15s; }
  .btn-pdf:hover { background: var(--orange-light); border-color: var(--orange); }

  .count-label { font-size: 0.8rem; color: var(--text-secondary); margin: 10px 0 0; text-align: right; }
  .state-msg   { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); font-size: 0.9rem; }
  .empty       { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .empty-icon  { font-size: 2rem; }

  .spinner { width: 32px; height: 32px; margin: 0 auto; border: 3px solid var(--border); border-top-color: var(--orange); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Expediente ──────────────────────────────────────────────────────────── */
  .expediente-topbar { margin-bottom: 1.5rem; }
  .btn-back { background: none; border: none; cursor: pointer; padding: 0; font-size: 0.875rem; font-weight: 600; color: var(--orange); }
  .btn-back:hover { text-decoration: underline; }
  .expediente-layout { display: grid; grid-template-columns: 300px 1fr; gap: 20px; align-items: start; }

  /* Ficha */
  .ficha-card { background: var(--bg-card); border-radius: var(--radius-card); border: 1px solid var(--border); box-shadow: var(--shadow-card); padding: 20px 22px; display: flex; flex-direction: column; gap: 16px; position: sticky; top: calc(56px + 16px); }
  .ficha-titulo { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-secondary); margin: 0; }
  .ficha-grid  { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; align-items: baseline; }
  .ficha-key   { font-size: 0.78rem; color: var(--text-secondary); white-space: nowrap; }
  .ficha-val   { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }
  .ficha-mono  { font-family: monospace; letter-spacing: 0.03em; }

  .promedio-box { background: var(--orange-light); border: 1px solid #FED7AA; border-radius: 10px; padding: 12px 16px; text-align: center; }
  .promedio-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin: 0 0 4px; }
  .promedio-valor { font-size: 2rem; font-weight: 800; color: var(--orange); margin: 0; line-height: 1; }
  .ficha-acciones { display: flex; flex-direction: column; gap: 8px; }

  /* Reportes */
  .reportes-card { background: var(--bg-card); border-radius: var(--radius-card); border: 1px solid var(--border); box-shadow: var(--shadow-card); padding: 24px 28px; display: flex; flex-direction: column; gap: 16px; }
  .card-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0; }

  @media (max-width: 768px) {
    .expediente-layout { grid-template-columns: 1fr; }
    .ficha-card        { position: static; }
  }
</style>