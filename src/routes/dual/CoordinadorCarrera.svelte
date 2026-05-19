<script>
  // src/routes/dual/CoordinadorCarrera.svelte
  // Importaciones desglosadas
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { 
    isAuthenticated, 
    isCoordinadorCarrera 
  } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'
  import FiltrosBarra from '../../lib/components/shared/FiltrosBarra.svelte'
  import { formatFecha } from '../../lib/utils.js'

  // Estado de control de vistas
  let vista = 'directorio'

  // Variables de control de la bandeja de alumnos
  let alumnos = []
  let loading = true
  let error = ''
  let filtroCuatrimestre = ''
  let filtroGrupo = ''
  let filtroBusqueda = ''
  let filtroCarrera = ''
  let filtroEstado = ''

  // Variables de control del expediente individual
  let alumnoSeleccionado = null
  let reportes = []
  let loadingExpediente = false
  let errorExpediente = ''

  // Validación de permisos de acceso
  onMount(async () => {
    if (!get(isAuthenticated) || !get(isCoordinadorCarrera)) {
      navigate('/login', { 
        replace: true 
      })
      return
    }
    await cargarAlumnos()
  })

  // Carga remota del directorio de alumnos
  async function cargarAlumnos() {
    loading = true
    error = ''
    try {
      const params = new URLSearchParams()
      if (filtroCuatrimestre) {
        params.append('cuatrimestre', filtroCuatrimestre)
      }
      if (filtroGrupo) {
        params.append('grupo', filtroGrupo)
      }
      alumnos = await api.dual.listarAlumnos(params.toString())
    } catch (e) {
      error = e.message || 'Error al cargar alumnos.'
    } finally {
      loading = false
    }
  }

  // Generación dinámica de catálogos para los filtros de la interfaz
  $: carreras = [
    ...new Set(alumnos.map(a => a.carrera).filter(Boolean))
  ].sort()
  
  $: grupos = [
    ...new Set(alumnos.map(a => a.nomenclatura || a.grupo).filter(Boolean))
  ].sort()

  // Lógica reactiva de filtrado en el cliente para búsqueda combinada
  $: alumnosFiltrados = alumnos.filter(a => {
    const matchBusqueda = filtroBusqueda.trim()
      ? a.matricula.toLowerCase().includes(filtroBusqueda.toLowerCase()) || 
        a.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase())
      : true
      
    const matchCarrera = filtroCarrera
      ? (a.carrera && a.carrera.toLowerCase() === filtroCarrera.toLowerCase()) || 
        (a.nomenclatura && a.nomenclatura.toLowerCase().includes(filtroCarrera.toLowerCase()))
      : true
      
    return matchBusqueda && matchCarrera
  })

  // Obtención del expediente de reportes semanales del alumno
  async function abrirExpediente(alumno) {
    alumnoSeleccionado = alumno
    reportes = []
    errorExpediente = ''
    loadingExpediente = true
    vista = 'expediente'
    
    try {
      reportes = await api.dual.expediente(
        alumno.matricula, 
        filtroCuatrimestre || null
      )
    } catch (e) {
      errorExpediente = e.message || 'Error al cargar el expediente.'
    } finally {
      loadingExpediente = false
    }
  }

  // Cierre del visor de expedientes
  function volverDirectorio() {
    alumnoSeleccionado = null
    reportes = []
    vista = 'directorio'
  }

  // Descarga del reporte estructurado en formato CSV
  function descargarCSV(matricula) {
    const params = filtroCuatrimestre 
      ? `?cuatrimestre=${filtroCuatrimestre}` 
      : ''
    const url = api.dual.exportarCSV(matricula) + params
    window.open(url, '_blank')
  }

  // Cálculo reactivo del promedio de calificaciones declaradas
  $: promedioExpediente = reportes.length
    ? (
        reportes.reduce((s, r) => s + Number(r.calificacion_alumno), 0) / 
        reportes.length
      ).toFixed(2)
    : null

  $: carreraCompletaExpediente = alumnoSeleccionado 
    ? alumnoSeleccionado.carrera 
    : '—'
</script>

<Navbar />

<div class="main-content">

  {#if vista === 'directorio'}
    <div class="page-wrap">
      <div class="page-header">
        <h1 class="page-title">Alumnos Duales</h1>
        <p class="page-sub">Directorio del cuatrimestre en curso</p>
      </div>

      <FiltrosBarra
        mostrarEstado={false}
        mostrarCarrera={true}
        mostrarGrupo={true}
        {grupos}
        {carreras}
        bind:filtroBusqueda
        bind:filtroGrupo
        bind:filtroCarrera
        bind:filtroEstado
        on:buscar={cargarAlumnos}
      />

      {#if loading}
        <div class="state-msg">
          <div class="spinner"></div>
        </div>
      {:else if error}
        <p class="error-msg">{error}</p>
      {:else if alumnosFiltrados.length === 0}
        <div class="state-msg empty">
          <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0
                 ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0
                 A17.933 17.933 0 0 1 12 21.75
                 c-2.676 0-5.216-.584-7.499-1.632Z" 
            />
          </svg>
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
                <th class="td-center">Reportes</th>
                <th class="td-center">Promedio</th>
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
                      <span class="empresa-txt">{a.empresa}</span>
                    {:else}
                      <span class="text-secondary">Sin asignar</span>
                    {/if}
                  </td>
                  <td class="td-center">
                    <span class="chip-reportes">
                      {a.reportes_aprobados ?? 0}
                    </span>
                  </td>
                  <td class="td-center td-promedio">
                    {a.promedio ?? '—'}
                  </td>
                  <td style="text-align: right;">
                    <button class="btn-ver" on:click={() => abrirExpediente(a)}>
                      Ver Expediente
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <p class="count-label">
          {alumnosFiltrados.length} alumno{alumnosFiltrados.length !== 1 ? 's' : ''}
        </p>
      {/if}
    </div>

  {:else if vista === 'expediente' && alumnoSeleccionado}
    <div class="page-wrap">
      <div class="expediente-topbar">
        <button class="btn-back" on:click={volverDirectorio}>
          <svg 
            width="16" 
            height="16" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2.2" 
            viewBox="0 0 24 24" 
            style="display:inline; margin-right:4px; vertical-align:text-bottom;"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              d="M10.5 19.5 L3 12 m0 0 l7.5-7.5 M3 12 h18" 
            />
          </svg>
          Volver al directorio
        </button>
      </div>

      <div class="expediente-layout">
        <div class="ficha-card">
          <p class="ficha-titulo">Datos del alumno</p>
          <div class="ficha-divider"></div>
          <div class="ficha-grid">
            <span class="ficha-key">Nombre</span>
            <span class="ficha-val">{alumnoSeleccionado.nombre}</span>
            <span class="ficha-key">Matrícula</span>
            <span class="ficha-val ficha-mono">{alumnoSeleccionado.matricula}</span>
            <span class="ficha-key">Carrera</span>
            <span class="ficha-val">{carreraCompletaExpediente}</span>
            <span class="ficha-key">Grupo</span>
            <span class="ficha-val ficha-mono">{alumnoSeleccionado.nomenclatura || '—'}</span>
            <span class="ficha-key">Empresa</span>
            <span class="ficha-val" style="color: var(--text-primary); font-weight:600;">
              {alumnoSeleccionado.empresa || 'Sin asignar'}
            </span>
            <span class="ficha-key">Turno</span>
            <span class="ficha-val">{alumnoSeleccionado.turno || '—'}</span>
          </div>

          {#if promedioExpediente}
            <div class="promedio-box">
              <p class="promedio-label">Promedio General</p>
              <p class="promedio-valor">{promedioExpediente}</p>
            </div>
          {/if}

          <div class="ficha-acciones">
            <button class="btn-primary" on:click={() => descargarCSV(alumnoSeleccionado.matricula)}>
              Exportar CSV
            </button>
            <button class="btn-outline" disabled title="Próximamente">
              Descargar todos los PDFs
            </button>
          </div>
        </div>

        <div class="reportes-card">
          <h2 class="card-title">Reportes Aprobados</h2>

          {#if loadingExpediente}
            <div class="state-msg">
              <div class="spinner"></div>
            </div>
          {:else if errorExpediente}
            <p class="error-msg">{errorExpediente}</p>
          {:else if reportes.length === 0}
            <div class="state-msg empty">
              <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.008 1.24l.885 1.77
                     a2.25 2.25 0 0 0 2.007 1.24h1.98a2.25 2.25 0 0 0 2.007-1.24
                     l.885-1.77a2.25 2.25 0 0 1 2.007-1.24h3.86
                     m-18 0h18a2.25 2.25 0 0 1 2.25 2.25v4.25
                     a2.25 2.25 0 0 1-2.25 2.25H2.25A2.25 2.25 0 0 1 0 20.25
                     v-4.25a2.25 2.25 0 0 1 2.25-2.25
                     Zm0-4.5h18A2.25 2.25 0 0 0 22.5 9V4.25
                     A2.25 2.25 0 0 0 20.25 2H3.75A2.25 2.25 0 0 0 1.5 4.25
                     V9A2.25 2.25 0 0 0 3.75 11.25Z" 
                />
              </svg>
              <p>Este alumno no tiene reportes aprobados aún.</p>
            </div>
          {:else}
            <div class="table-wrap">
              <table class="tabla">
                <thead>
                  <tr>
                    <th>Semana</th>
                    <th class="td-center">Calificación</th>
                    <th>Entregado</th>
                    <th style="text-align: right;">Documento</th>
                  </tr>
                </thead>
                <tbody>
                  {#each reportes as r}
                    <tr>
                      <td>
                        <span class="sem-txt">Semana {r.semana}</span>
                      </td>
                      <td class="td-cal">{r.calificacion_alumno}</td>
                      <td class="td-fecha">{formatFecha(r.created_at)}</td>
                      <td style="text-align: right;">
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
            <p class="count-label">
              {reportes.length} reporte{reportes.length !== 1 ? 's' : ''} aprobado{reportes.length !== 1 ? 's' : ''}
            </p>
          {/if}
        </div>
      </div>
    </div>
  {/if}

</div>

<style>
  .main-content { 
    padding-top: 56px;
    background: var(--bg-page); 
    min-height: 100vh; 
  }

  .page-wrap { 
    padding: 40px 24px; 
    max-width: 1100px; 
    margin: 0 auto;
    display: flex; 
    flex-direction: column; 
    gap: 20px; 
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
    margin-top: 2px;
  }

  .table-wrap { 
    overflow-x: auto; 
    border: 1px solid var(--border); 
    border-radius: var(--radius-card);
    background: var(--bg-card); 
    box-shadow: var(--shadow-card); 
  }

  .tabla { 
    width: 100%; 
    border-collapse: collapse; 
    font-size: 14px;
  }

  .tabla thead { 
    background: var(--bg-page); 
  }

  .tabla th { 
    text-align: left; 
    padding: 12px 18px; 
    font-weight: 600;
    color: var(--text-disabled); 
    font-size: 11px; 
    text-transform: uppercase; 
    letter-spacing: 0.05em; 
    border-bottom: 1px solid var(--border); 
    white-space: nowrap;
  }

  .tabla td { 
    padding: 14px 18px; 
    color: var(--text-secondary); 
    border-bottom: 1px solid var(--border); 
    vertical-align: middle;
  }

  .tabla tbody tr:last-child td { 
    border-bottom: none; 
  }

  .tabla tbody tr:hover { 
    background: var(--orange-light);
  }

  .td-matricula { 
    font-family: monospace; 
    font-weight: 600; 
    color: var(--text-primary); 
    letter-spacing: 0.02em; 
  }

  .td-nombre { 
    font-weight: 600; 
    color: var(--text-primary);
  }

  .td-grupo { 
    font-family: monospace; 
    font-size: 13px; 
    color: var(--text-secondary); 
  }

  .td-center { 
    text-align: center;
  }

  .td-cal { 
    font-weight: 700; 
    color: var(--orange); 
    font-size: 15px; 
    text-align: center; 
  }

  .td-fecha { 
    font-size: 13px; 
    color: var(--text-secondary);
    white-space: nowrap; 
  }

  .td-promedio { 
    font-weight: 700; 
    color: var(--text-primary); 
  }

  .text-secondary { 
    color: var(--text-disabled); 
    font-style: italic;
  }

  .empresa-txt { 
    font-weight: 500; 
    color: var(--text-primary); 
  }

  .sem-txt { 
    font-weight: 600; 
    color: var(--text-primary);
  }

  .chip-reportes { 
    display: inline-block; 
    background: rgba(249, 115, 22, 0.08); 
    color: var(--orange); 
    font-weight: 700; 
    font-size: 12px; 
    border-radius: 6px;
    padding: 2px 10px; 
    border: 1px solid rgba(249, 115, 22, 0.2); 
  }
  
  .btn-ver { 
    background: transparent;
    border: 1.5px solid var(--border-input); 
    border-radius: 8px; 
    padding: 6px 14px; 
    font-size: 13px; 
    font-weight: 600; 
    color: var(--text-primary); 
    cursor: pointer;
    transition: all 0.2s ease; 
  }

  .btn-ver:hover { 
    border-color: var(--orange); 
    color: var(--orange); 
    background: var(--orange-light); 
  }

  .btn-pdf { 
    display: inline-block;
    background: transparent; 
    border: 1.5px solid var(--border-input); 
    border-radius: 8px; 
    padding: 5px 12px; 
    font-size: 12px; 
    font-weight: 600; 
    color: var(--orange); 
    text-decoration: none;
    transition: all 0.2s ease; 
  }

  .btn-pdf:hover { 
    background: var(--orange-hover); 
    color: white; 
    border-color: var(--orange-hover); 
  }

  .count-label { 
    font-size: 12px;
    color: var(--text-disabled); 
    text-align: right; 
    margin-top: 4px; 
    font-weight: 500; 
  }

  .state-msg { 
    text-align: center; 
    padding: 48px 16px; 
    color: var(--text-secondary);
  }

  .empty { 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    gap: 12px; 
    color: var(--text-disabled);
  }

  .empty p { 
    font-size: 14px; 
  }

  .spinner { 
    width: 28px; 
    height: 28px; 
    margin: 0 auto;
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

  .btn-back { 
    background: none; 
    border: none; 
    cursor: pointer; 
    padding: 0; 
    font-family: var(--font); 
    font-size: 14px; 
    font-weight: 600; 
    color: var(--text-secondary);
    transition: color 0.15s; 
  }

  .btn-back:hover { 
    color: var(--orange); 
  }

  .expediente-layout { 
    display: grid; 
    grid-template-columns: 320px 1fr; 
    gap: 24px;
    align-items: start; 
  }

  .ficha-card { 
    background: var(--bg-card); 
    border-radius: var(--radius-card);
    border: 1px solid var(--border); 
    box-shadow: var(--shadow-card); 
    padding: 24px; 
    display: flex; 
    flex-direction: column; 
    gap: 16px; 
    position: sticky; 
    top: calc(56px + 24px);
  }

  .ficha-titulo { 
    font-size: 12px; 
    font-weight: 700; 
    text-transform: uppercase; 
    letter-spacing: 0.05em; 
    color: var(--text-disabled); 
    margin: 0;
  }

  .ficha-divider { 
    height: 1px; 
    background: var(--border); 
    width: 100%; 
    margin-top: -4px; 
  }

  .ficha-grid { 
    display: grid;
    grid-template-columns: auto 1fr; 
    gap: 10px 16px; 
    align-items: baseline; 
  }

  .ficha-key { 
    font-size: 11px; 
    font-weight: 600; 
    color: var(--text-disabled);
    text-transform: uppercase; 
    letter-spacing: 0.02em; 
  }

  .ficha-val { 
    font-size: 14px; 
    font-weight: 500; 
    color: var(--text-secondary); 
    word-break: break-word;
  }

  .ficha-mono { 
    font-family: monospace; 
    font-weight: 600; 
    color: var(--text-primary); 
  }

  .promedio-box { 
    background: rgba(249, 115, 22, 0.06);
    border: 1px solid rgba(249, 115, 22, 0.15); 
    border-radius: 12px; 
    padding: 14px; 
    text-align: center; 
  }

  .promedio-label { 
    font-size: 11px;
    font-weight: 700; 
    text-transform: uppercase; 
    letter-spacing: 0.05em; 
    color: var(--orange); 
    margin: 0 0 4px; 
  }

  .promedio-valor { 
    font-size: 32px; 
    font-weight: 800;
    color: var(--orange); 
    margin: 0; 
    line-height: 1; 
    letter-spacing: -0.03em; 
  }

  .ficha-acciones { 
    display: flex; 
    flex-direction: column; 
    gap: 10px; 
    margin-top: 4px;
  }

  .reportes-card { 
    background: var(--bg-card); 
    border-radius: var(--radius-card); 
    border: 1px solid var(--border);
    box-shadow: var(--shadow-card); 
    padding: 28px; 
    display: flex; 
    flex-direction: column; 
    gap: 20px; 
  }

  .card-title { 
    font-size: 16px; 
    font-weight: 700; 
    color: var(--text-primary);
    margin: 0; 
  }

  @media (max-width: 900px) {
    .expediente-layout { 
      grid-template-columns: 1fr;
    }
    .ficha-card { 
      position: static; 
    }
  }
</style>