<script>
  // src/routes/dual/CoordinadorDual.svelte
  // Importaciones desglosadas
  import { onMount } from 'svelte'
  import { 
    navigate, 
    useLocation 
  } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { 
    isAuthenticated, 
    isCoordinadorDual 
  } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'
  import FiltrosBarra from '../../lib/components/shared/FiltrosBarra.svelte'
  import { 
    formatFecha, 
    estadoBadgeClass 
  } from '../../lib/utils.js'

  const location = useLocation()

  // Estado de control de vistas
  let vista = 'bandeja'

  // Sincronización reactiva de la vista con la URL
  $: {
    const queryVista = new URLSearchParams($location.search).get('vista') === 'empresas' 
      ? 'empresas' 
      : 'bandeja'
      
    if (queryVista === 'empresas' && vista !== 'empresas') {
      vista = 'empresas'
      cargarEmpresas()
    } else if (queryVista === 'bandeja' && vista === 'empresas') {
      vista = 'bandeja'
      cargarReportes()
    }
  }

  // Variables de control de la bandeja
  let reportes = []
  let loading = true
  let error = ''
  let filtroEstado = 'Pendiente'
  let filtroBusqueda = ''
  let filtroCarrera = ''
  let filtroGrupo = ''

  // Extracción dinámica de catálogos para filtros
  $: grupos = [
    ...new Set(reportes.map(r => r.nomenclatura).filter(Boolean))
  ].sort()
  
  $: carreras = [
    ...new Set(reportes.map(r => r.carrera).filter(Boolean))
  ].sort()

  // Lógica reactiva de filtrado en cliente
  $: reportesFiltrados = reportes.filter(r => {
    const matchBusqueda = filtroBusqueda.trim()
      ? r.matricula.toLowerCase().includes(filtroBusqueda.toLowerCase()) || 
        (r.nombre && r.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()))
      : true
      
    const matchCarrera = filtroCarrera 
      ? (r.carrera && r.carrera.toLowerCase() === filtroCarrera.toLowerCase()) 
      : true
      
    const matchGrupo = filtroGrupo 
      ? (r.nomenclatura && r.nomenclatura.toLowerCase() === filtroGrupo.toLowerCase()) 
      : true
      
    const matchEstado = filtroEstado 
      ? r.estado === filtroEstado 
      : true
      
    return matchBusqueda && matchCarrera && matchGrupo && matchEstado
  })

  // Variables de control de la revisión individual
  let seleccionado = null
  let accion = ''
  let nota = ''
  let enviando = false
  let exito = ''
  let errorAccion = ''

  // Variables de control de catálogo de empresas y asignaciones
  let empresas = []
  let loadingEmpresas = false
  let nuevaEmpresa = ''
  let empresaSeleccionada = ''
  let matriculaBusqueda = ''
  let alumnoPreview = null
  let loadingPreview = false
  let errorAsignacion = ''
  let exitoAsignacion = ''
  let guardandoAsignacion = false

  // Verificación de sesión y permisos
  onMount(() => {
    if (!get(isAuthenticated) || !get(isCoordinadorDual)) {
      navigate('/login', { 
        replace: true 
      })
      return
    }
    
    const initialVista = new URLSearchParams(window.location.search).get('vista') === 'empresas' 
      ? 'empresas' 
      : 'bandeja'
      
    vista = initialVista

    if (vista === 'empresas') {
      cargarEmpresas()
    } else {
      cargarReportes()
    }
  })

  // Carga remota de reportes semanales
  async function cargarReportes() {
    loading = true
    error = ''
    try {
      const params = new URLSearchParams()
      if (filtroEstado) {
        params.append('estado', filtroEstado)
      }
      reportes = await api.dual.listarReportes(params.toString())
    } catch (e) {
      error = e.message || 'Error al cargar reportes.'
    } finally {
      loading = false
    }
  }

  // Apertura del visor de dictamen
  function abrirRevision(reporte) {
    seleccionado = reporte
    accion = ''
    nota = ''
    exito = ''
    errorAccion = ''
    vista = 'revision'
  }

  // Cierre del visor de dictamen
  function volverBandeja() {
    seleccionado = null
    vista = 'bandeja'
    cargarReportes()
  }

  // Envío del dictamen del reporte a la API
  async function enviarDecision() {
    if (!accion) { 
      errorAccion = 'Selecciona una acción.'
      return 
    }
    if (accion === 'rechazar' && !nota.trim()) {
      errorAccion = 'Escribe una nota al rechazar.'
      return
    }
    enviando = true
    errorAccion = ''
    exito = ''
    try {
      const body = { 
        estado: accion === 'aprobar' ? 'Aprobada' : 'Rechazada' 
      }
      if (nota.trim()) {
        body.nota_agente = nota.trim()
      }
      
      await api.dual.revisarReporte(seleccionado.id, body)
      
      exito = accion === 'aprobar'
        ? 'Reporte aprobado correctamente.'
        : 'Reporte rechazado. El alumno podrá reenviar.'
        
      seleccionado = {
        ...seleccionado,
        estado: accion === 'aprobar' ? 'Aprobada' : 'Rechazada',
        nota_agente: nota.trim() || seleccionado.nota_agente
      }
    } catch (e) {
      errorAccion = e.message || 'Error al enviar la decisión.'
    } finally {
      enviando = false
    }
  }

  // Carga remota del catálogo corporativo
  async function cargarEmpresas() {
    loadingEmpresas = true
    try {
      empresas = await api.dual.listarEmpresas()
    } catch {
      errorAsignacion = 'No se pudieron cargar las empresas.'
    } finally {
      loadingEmpresas = false
    }
  }

  // Consulta de alumno por matrícula para previsualización
  async function buscarAlumno() {
    if (!matriculaBusqueda.trim()) {
      return
    }
    loadingPreview = true
    alumnoPreview = null
    errorAsignacion = ''
    try {
      alumnoPreview = await api.dual.buscarAlumno(matriculaBusqueda.trim())
      empresaSeleccionada = alumnoPreview.empresa_id || ''
    } catch {
      errorAsignacion = 'Alumno no encontrado.'
    } finally {
      loadingPreview = false
    }
  }

  // Inserción de nueva unidad económica en el catálogo
  async function crearEmpresa() {
    if (!nuevaEmpresa.trim()) {
      return
    }
    try {
      const emp = await api.dual.crearEmpresa({ 
        nombre: nuevaEmpresa.trim() 
      })
      empresas = [
        ...empresas, 
        emp
      ]
      empresaSeleccionada = emp.id
      nuevaEmpresa = ''
    } catch (e) {
      errorAsignacion = e.message || 'Error al crear la empresa.'
    }
  }

  // Persistencia de adscripción de empresa al alumno
  async function guardarAsignacion() {
    errorAsignacion = ''
    exitoAsignacion = ''
    if (!alumnoPreview) { 
      errorAsignacion = 'Busca un alumno primero.'
      return 
    }
    if (!empresaSeleccionada) { 
      errorAsignacion = 'Selecciona una empresa.'
      return 
    }
    guardandoAsignacion = true
    try {
      await api.dual.actualizarAlumnoDual(alumnoPreview.matricula, {
        alumno_dual: true,
        empresa_id: empresaSeleccionada
      })
      
      exitoAsignacion = 'Alumno dual actualizado correctamente.'
      
      const nombreEmpresa = empresas.find(e => e.id === empresaSeleccionada)?.nombre
      alumnoPreview = {
        ...alumnoPreview,
        es_alumno_dual: true,
        empresa_id: empresaSeleccionada,
        empresa: nombreEmpresa
      }
    } catch (e) {
      errorAsignacion = e.message || 'Error al guardar la asignación.'
    } finally {
      guardandoAsignacion = false
    }
  }

  // Remoción del estatus y vinculación dual del estudiante
  async function quitarDual() {
    if (!alumnoPreview) {
      return
    }
    guardandoAsignacion = true
    errorAsignacion = ''
    exitoAsignacion = ''
    try {
      await api.dual.actualizarAlumnoDual(alumnoPreview.matricula, { 
        alumno_dual: false 
      })
      exitoAsignacion = 'Rol dual removido correctamente.'
      alumnoPreview = { 
        ...alumnoPreview, 
        es_alumno_dual: false, 
        activo: false 
      }
    } catch (e) {
      errorAsignacion = e.message || 'Error al quitar el rol dual.'
    } finally {
      guardandoAsignacion = false
    }
  }

  // Mapeos inline desglosados
  $: carreraCompletaRevision = seleccionado 
    ? seleccionado.carrera 
    : '—'
    
  $: carreraCompletaPreview = alumnoPreview 
    ? alumnoPreview.carrera 
    : '—'
</script>

<Navbar />

<div class="main-content">

  {#if vista === 'bandeja'}
    <div class="page-wrap">
      <div class="page-header">
        <h1 class="page-title">Bandeja de Reportes Duales</h1>
        <p class="page-sub">Revisión semanal de entregas de alumnos DUAL</p>
      </div>

      <FiltrosBarra
        mostrarCarrera={true}
        mostrarGrupo={true}
        mostrarEstado={true}
        {grupos}
        {carreras}
        bind:filtroEstado
        bind:filtroBusqueda
        bind:filtroCarrera
        bind:filtroGrupo
        on:buscar={cargarReportes}
      />

      {#if loading}
        <div class="state-msg">
          <div class="spinner"></div>
        </div>
      {:else if error}
        <p class="error-msg">{error}</p>
      {:else if reportesFiltrados.length === 0}
        <div class="state-msg empty">
          <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              d="M21.75 9
                 v.906
                 a2.25 2.25 0 0 1-.194.916
                 l-3.07 6.143
                 A2.25 2.25 0 0 1 16.471 18.25
                 H7.529
                 a2.25 2.25 0 0 1-2.015-1.285
                 L2.444 10.822
                 A2.25 2.25 0 0 1 2.25 9.906
                 V9
                 M21.75 9
                 a2.25 2.25 0 0 0-2.25-2.25
                 H4.5
                 A2.25 2.25 0 0 0 2.25 9
                 m19.5 0
                 v.243
                 a2.25 2.25 0 0 1-1.07 1.916
                 l-7.5 4.615
                 a2.25 2.25 0 0 1-2.36 0
                 L3.32 11.16
                 a2.25 2.25 0 0 1-1.07-1.916
                 V9" 
            />
          </svg>
          <p>No hay reportes con los filtros seleccionados.</p>
        </div>
      {:else}
        <div class="table-wrap">
          <table class="reporte-table">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Nombre</th>
                <th class="td-center">Calificación</th>
                <th>Estado</th>
                <th>Entregado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {#each reportesFiltrados as r}
                <tr class:row-pendiente={r.estado === 'Pendiente'}>
                  <td class="td-matricula">{r.matricula}</td>
                  <td class="td-nombre">{r.nombre || '—'}</td>
                  <td class="td-cal">{r.calificacion_alumno}</td>
                  <td>
                    <span class={estadoBadgeClass(r.estado)}>
                      {r.estado}
                    </span>
                  </td>
                  <td class="td-fecha">{formatFecha(r.created_at)}</td>
                  <td style="text-align: right;">
                    <button class="btn-revisar" on:click={() => abrirRevision(r)}>
                      {r.estado === 'Pendiente' ? 'Revisar' : 'Ver'}
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <p class="count-label">
          {reportesFiltrados.length} reporte{reportesFiltrados.length !== 1 ? 's' : ''}
        </p>
      {/if}
    </div>

  {:else if vista === 'revision' && seleccionado}
    <div class="revision-wrap">
      <div class="revision-topbar">
        <button class="btn-back" on:click={volverBandeja}>
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
          Volver a la bandeja
        </button>
        <span class={estadoBadgeClass(seleccionado.estado)}>
          {seleccionado.estado}
        </span>
      </div>

      <div class="split-layout">
        <div class="panel-pdf">
          <div class="panel-label">Documento del reporte</div>
          {#if seleccionado.archivo_pdf_url}
            <iframe 
              src={seleccionado.archivo_pdf_url} 
              title="Reporte PDF" 
              class="pdf-iframe"
            ></iframe>
            <a 
              href={seleccionado.archivo_pdf_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              class="link-externo"
            >
              Abrir en pestaña independiente ↗
            </a>
          {:else}
            <div class="no-pdf">No hay un archivo PDF asociado a esta entrega.</div>
          {/if}
        </div>

        <div class="panel-acciones">
          <div class="panel-label">Evaluación del Agente</div>

          <div class="dato-cal">
            <p class="dato-label">Nota de la Empresa</p>
            <p class="dato-valor">{seleccionado.calificacion_alumno}</p>
          </div>

          <div class="ficha-alumno">
            <p class="ficha-titulo">Ficha del estudiante</p>
            <div class="ficha-grid">
              <span class="ficha-key">Nombre</span>
              <span class="ficha-val">{seleccionado.nombre || '—'}</span>
              <span class="ficha-key">Matrícula</span>
              <span class="ficha-val ficha-mono">{seleccionado.matricula}</span>
              <span class="ficha-key">Carrera</span>
              <span class="ficha-val">{carreraCompletaRevision}</span>
              <span class="ficha-key">Empresa</span>
              <span class="ficha-val" style="font-weight:600; color:var(--text-primary);">
                {seleccionado.empresa || 'Sin asignar'}
              </span>
              <span class="ficha-key">Grupo</span>
              <span class="ficha-val ficha-mono">
                {seleccionado.nomenclatura || seleccionado.cuatrimestre || '—'}
              </span>
              <span class="ficha-key">Periodo</span>
              <span class="ficha-val" style="font-weight:600;">
                Semana {seleccionado.semana}
              </span>
              <span class="ficha-key">Entregado</span>
              <span class="ficha-val">{formatFecha(seleccionado.created_at)}</span>
            </div>
          </div>

          {#if seleccionado.nota_agente}
            <div class="nota-previa">
              <p class="dato-label">Observaciones registradas</p>
              <p class="nota-texto">{seleccionado.nota_agente}</p>
            </div>
          {/if}

          {#if seleccionado.estado === 'Pendiente'}
            <div class="acciones-grupo">
              <div class="btn-decision-row">
                <button
                  class="btn-decision btn-aprobar"
                  class:activo={accion === 'aprobar'}
                  on:click={() => { accion = 'aprobar'; nota = '' }}
                >
                  ✓ Aprobar
                </button>
                <button
                  class="btn-decision btn-rechazar"
                  class:activo={accion === 'rechazar'}
                  on:click={() => accion = 'rechazar'}
                >
                  ✕ Rechazar
                </button>
              </div>

              {#if accion === 'rechazar' || accion === 'aprobar'}
                <div style="margin-top:14px">
                  <textarea
                    class="input-plain textarea-nota"
                    placeholder={accion === 'rechazar' ? 'Razón técnica del rechazo (obligatorio)…' : 'Retroalimentación opcional para el alumno…'}
                    rows="3"
                    bind:value={nota}
                  ></textarea>
                </div>
              {/if}

              {#if errorAccion}
                <p class="error-msg" style="margin-top:12px">{errorAccion}</p>
              {/if}
              {#if exito}
                <p class="exito-msg">{exito}</p>
              {/if}

              {#if !exito}
                <button
                  class="btn-primary"
                  style="width:100%; margin-top:14px"
                  on:click={enviarDecision}
                  disabled={enviando || !accion}
                >
                  {enviando ? 'Procesando…' : 'Emitir Dictamen'}
                </button>
              {:else}
                <button class="btn-outline" style="width:100%; margin-top:12px" on:click={volverBandeja}>
                  Volver a la bandeja
                </button>
              {/if}
            </div>
          {:else}
            <div class="ya-revisado">
              <p>Este reporte ya fue evaluado como 
                <span class="status-final" class:text-verde={seleccionado.estado === 'Aprobada'} class:text-rojo={seleccionado.estado === 'Rechazada'}>
                  {seleccionado.estado.toLowerCase()}
                </span>.
              </p>
              <button class="btn-outline" style="margin-top:16px; width:100%" on:click={volverBandeja}>
                Regresar a la lista
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>

  {:else if vista === 'empresas'}
    <div class="page-wrap">
      <div class="page-header">
        <h1 class="page-title">Gestión de Alumnos Duales</h1>
        <p class="page-sub">Asigna empresas y vincula roles a la comunidad DUAL</p>
      </div>

      {#if loadingEmpresas}
        <div class="state-msg">
          <div class="spinner"></div>
        </div>
      {:else}
        <div class="empresas-layout">
          <div class="card-seccion">
            <h2 class="seccion-title">Vincular Estudiante</h2>

            {#if errorAsignacion}
              <div class="error-msg">{errorAsignacion}</div>
            {/if}
            {#if exitoAsignacion}
              <div class="exito-msg">{exitoAsignacion}</div>
            {/if}

            <div class="nueva-empresa-row">
              <input
                class="input-plain"
                placeholder="Ingresa la matrícula…"
                bind:value={matriculaBusqueda}
                on:keydown={(e) => e.key === 'Enter' && buscarAlumno()}
              />
              <button 
                class="btn-primary" 
                style="white-space:nowrap; width:auto; padding:0 20px; height:42px;" 
                on:click={buscarAlumno} 
                disabled={loadingPreview}
              >
                {loadingPreview ? '...' : 'Buscar'}
              </button>
            </div>

            {#if alumnoPreview}
              <div class="ficha-alumno" style="margin:8px 0 0 0;">
                <p class="ficha-titulo font-semibold">Perfil Encontrado</p>
                <div class="ficha-grid">
                  <span class="ficha-key">Nombre</span>
                  <span class="ficha-val">{alumnoPreview.nombre}</span>
                  <span class="ficha-key">Carrera</span>
                  <span class="ficha-val">{carreraCompletaPreview}</span>
                  <span class="ficha-key">Grupo</span>
                  <span class="ficha-val ficha-mono">{alumnoPreview.nomenclatura || '—'}</span>
                  <span class="ficha-key">Estatus Dual</span>
                  <span class="ficha-val">
                    {alumnoPreview.es_alumno_dual ? '✅ Activo' : '❌ Inactivo'}
                  </span>
                  <span class="ficha-key">Empresa actual</span>
                  <span class="ficha-val" style="font-weight:600;">
                    {alumnoPreview.empresa || 'Sin asignar'}
                  </span>
                </div>
              </div>

              <div class="field" style="margin-top:8px;">
                <label for="empresa-select">Asignar Unidad Económica</label>
                <select id="empresa-select" class="input-plain" bind:value={empresaSeleccionada}>
                  <option value="">Selecciona una empresa corporativa</option>
                  {#each empresas as emp}
                    <option value={emp.id}>{emp.nombre}</option>
                  {/each}
                </select>
              </div>

              <div class="nueva-empresa-row">
                <input
                  class="input-plain"
                  placeholder="Añadir una nueva empresa al catálogo…"
                  bind:value={nuevaEmpresa}
                  on:keydown={(e) => e.key === 'Enter' && crearEmpresa()}
                />
                <button 
                  class="btn-outline" 
                  style="white-space:nowrap; height:42px;" 
                  on:click={crearEmpresa} 
                  disabled={!nuevaEmpresa.trim()}
                >
                  + Agregar
                </button>
              </div>

              <div style="display:flex; gap:10px; margin-top:12px">
                <button
                  class="btn-primary"
                  style="flex:1"
                  on:click={guardarAsignacion}
                  disabled={guardandoAsignacion || !empresaSeleccionada}
                >
                  {guardandoAsignacion ? 'Guardando...' : alumnoPreview.es_alumno_dual ? 'Actualizar' : 'Activar Estatus Dual'}
                </button>
                {#if alumnoPreview.es_alumno_dual}
                  <button
                    class="btn-outline btn-danger"
                    style="flex:1"
                    on:click={quitarDual}
                    disabled={guardandoAsignacion}
                  >
                    Baja del Programa
                  </button>
                {/if}
              </div>
            {/if}
          </div>

          <div class="card-seccion">
            <h2 class="seccion-title">Empresas en Convenio</h2>
            {#if empresas.length === 0}
              <p class="empty-msg">No hay entidades registradas en el catálogo actual.</p>
            {:else}
              <ul class="empresa-list">
                {#each empresas as emp}
                  <li class="empresa-item">
                    <span class="empresa-nombre">{emp.nombre}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </div>
      {/if}
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
    max-width: 1000px; 
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
  
  .reporte-table { 
    width: 100%; 
    border-collapse: collapse; 
    font-size: 14px; 
  }
  
  .reporte-table thead { 
    background: var(--bg-page); 
  }
  
  .reporte-table th { 
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
  
  .reporte-table td { 
    padding: 14px 18px; 
    color: var(--text-secondary); 
    border-bottom: 1px solid var(--border); 
    vertical-align: middle; 
  }
  
  .reporte-table tbody tr:last-child td { 
    border-bottom: none; 
  }
  
  .reporte-table tbody tr:hover { 
    background: var(--orange-light); 
  }
  
  .row-pendiente { 
    border-left: 4px solid var(--orange); 
  }

  .td-matricula { 
    font-family: monospace; 
    font-weight: 600; 
    color: var(--text-primary); 
  }
  
  .td-nombre { 
    font-weight: 600; 
    color: var(--text-primary); 
  }
  
  .td-cal { 
    font-weight: 700; 
    color: var(--orange); 
    font-size: 15px; 
  }
  
  .td-fecha { 
    color: var(--text-secondary); 
    font-size: 13px; 
    white-space: nowrap; 
  }

  .btn-revisar { 
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
  
  .btn-revisar:hover { 
    border-color: var(--orange); 
    color: var(--orange); 
    background: var(--orange-light); 
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

  .revision-wrap { 
    display: flex; 
    flex-direction: column; 
    height: calc(100vh - 56px); 
    overflow: hidden; 
    background: var(--bg-page); 
  }
  
  .revision-topbar { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    padding: 14px 24px; 
    background: var(--bg-card); 
    border-bottom: 1px solid var(--border); 
    box-shadow: 0 1px 2px rgba(0,0,0,0.02); 
  }
  
  .btn-back { 
    background: none; 
    border: none; 
    cursor: pointer; 
    font-family: var(--font); 
    font-size: 14px; 
    font-weight: 600; 
    color: var(--text-secondary); 
    display: flex; 
    align-items: center; 
    transition: color 0.15s; 
  }
  
  .btn-back:hover { 
    color: var(--orange); 
  }
  
  .split-layout { 
    display: grid; 
    grid-template-columns: 1fr 360px; 
    flex: 1; 
    overflow: hidden; 
  }
  
  .panel-pdf { 
    display: flex; 
    flex-direction: column; 
    border-right: 1px solid var(--border); 
    overflow: hidden; 
    background: #1e293b; 
  }
  
  .panel-label { 
    font-size: 11px; 
    font-weight: 700; 
    text-transform: uppercase; 
    letter-spacing: 0.05em; 
    color: var(--text-disabled); 
    padding: 10px 20px; 
    border-bottom: 1px solid var(--border); 
    background: var(--bg-page); 
  }
  
  .pdf-iframe { 
    flex: 1; 
    width: 100%; 
    border: none; 
    background: #fff; 
  }
  
  .link-externo { 
    display: block; 
    padding: 10px 20px; 
    font-size: 13px; 
    font-weight: 500; 
    color: var(--orange); 
    text-decoration: none; 
    border-top: 1px solid var(--border); 
    background: var(--bg-card); 
    transition: background 0.15s; 
  }
  
  .link-externo:hover { 
    background: var(--orange-light); 
  }
  
  .no-pdf { 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    flex: 1; 
    color: #94a3b8; 
    font-size: 14px; 
    font-style: italic; 
  }
  
  .panel-acciones { 
    display: flex; 
    flex-direction: column; 
    overflow-y: auto; 
    background: var(--bg-card); 
    gap: 1px; 
  }

  .dato-cal { 
    margin: 20px 20px 0; 
    padding: 16px; 
    background: rgba(249, 115, 22, 0.06); 
    border: 1px solid rgba(249, 115, 22, 0.15); 
    border-radius: 12px; 
  }
  
  .dato-label { 
    font-size: 11px; 
    font-weight: 700; 
    color: var(--text-disabled); 
    margin: 0 0 4px; 
    text-transform: uppercase; 
    letter-spacing: 0.05em; 
  }
  
  .dato-valor { 
    font-size: 36px; 
    font-weight: 800; 
    color: var(--orange); 
    margin: 0; 
    line-height: 1; 
    letter-spacing: -0.02em; 
  }

  .ficha-alumno { 
    margin: 16px 20px 0; 
    padding: 16px; 
    border: 1px solid var(--border); 
    border-radius: 12px; 
    background: var(--bg-page); 
  }
  
  .ficha-titulo { 
    font-size: 11px; 
    font-weight: 700; 
    text-transform: uppercase; 
    letter-spacing: 0.05em; 
    color: var(--text-disabled); 
    margin: 0 0 12px; 
  }
  
  .ficha-grid { 
    display: grid; 
    grid-template-columns: auto 1fr; 
    gap: 8px 16px; 
    align-items: baseline; 
  }
  
  .ficha-key { 
    font-size: 11px; 
    font-weight: 600; 
    color: var(--text-disabled); 
    text-transform: uppercase; 
  }
  
  .ficha-val { 
    font-size: 13px; 
    font-weight: 500; 
    color: var(--text-secondary); 
    word-break: break-word; 
  }
  
  .ficha-mono { 
    font-family: monospace; 
    font-weight: 600; 
    color: var(--text-primary); 
  }

  .nota-previa { 
    margin: 16px 20px 0; 
    padding: 14px; 
    background: rgba(249, 115, 22, 0.04); 
    border: 1px solid var(--border); 
    border-radius: 12px; 
  }
  
  .nota-texto { 
    font-size: 13px; 
    color: var(--text-secondary); 
    margin: 4px 0 0; 
    line-height: 1.5; 
  }

  .acciones-grupo { 
    padding: 20px; 
    margin-top: auto; 
  }
  
  .btn-decision-row { 
    display: flex; 
    gap: 10px; 
  }
  
  .btn-decision { 
    flex: 1; 
    padding: 12px 8px; 
    border-radius: 8px; 
    font-size: 13px; 
    font-weight: 700; 
    cursor: pointer; 
    transition: all 0.15s ease; 
    border: 1.5px solid transparent; 
    text-align: center; 
  }
  
  .btn-aprobar { 
    background: rgba(34, 197, 94, 0.08); 
    color: var(--success); 
    border-color: rgba(34, 197, 94, 0.2); 
  }
  
  .btn-aprobar:hover, 
  .btn-aprobar.activo { 
    background: var(--success); 
    color: white; 
    border-color: var(--success); 
  }
  
  .btn-rechazar { 
    background: rgba(239, 68, 68, 0.08); 
    color: var(--error); 
    border-color: rgba(239, 68, 68, 0.2); 
  }
  
  .btn-rechazar:hover, 
  .btn-rechazar.activo { 
    background: var(--error); 
    color: white; 
    border-color: var(--error); 
  }
  
  .textarea-nota { 
    width: 100%; 
    min-height: 84px; 
    resize: none; 
    margin-top: 4px; 
  }

  .exito-msg { 
    color: var(--success); 
    background: rgba(34, 197, 94, 0.08); 
    border: 1px solid rgba(34, 197, 94, 0.2); 
    border-radius: 8px; 
    padding: 10px 14px; 
    font-size: 13px; 
    margin-top: 12px; 
    font-weight: 500; 
    text-align: center; 
  }
  
  .ya-revisado { 
    padding: 24px 20px; 
    font-size: 14px; 
    color: var(--text-secondary); 
    text-align: center; 
  }
  
  .status-final { 
    font-weight: 700; 
    text-transform: uppercase; 
    letter-spacing: 0.02em; 
  }
  
  .text-verde { 
    color: var(--success); 
  }
  
  .text-rojo { 
    color: var(--error); 
  }
  
  .btn-danger { 
    color: var(--error) !important; 
    border-color: rgba(239, 68, 68, 0.3) !important; 
  }
  
  .btn-danger:hover { 
    background: var(--error) !important; 
    color: white !important; 
    border-color: var(--error) !important; 
  }

  .empresas-layout { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 24px; 
    margin-top: 8px; 
  }
  
  .card-seccion { 
    background: var(--bg-card); 
    border-radius: var(--radius-card); 
    box-shadow: var(--shadow-card); 
    padding: 28px; 
    display: flex; 
    flex-direction: column; 
    gap: 16px; 
    border: 1px solid var(--border); 
  }
  
  .seccion-title { 
    font-size: 15px; 
    font-weight: 700; 
    color: var(--text-primary); 
    margin: 0; 
  }
  
  .field { 
    display: flex; 
    flex-direction: column; 
    gap: 6px; 
  }
  
  .field label { 
    font-size: 13px; 
    font-weight: 600; 
    color: var(--text-secondary); 
  }
  
  .nueva-empresa-row { 
    display: flex; 
    gap: 10px; 
    align-items: center; 
    width: 100%; 
  }
  
  .empresa-list { 
    list-style: none; 
    padding: 0; 
    margin: 0; 
    display: flex; 
    flex-direction: column; 
    gap: 8px; 
    overflow-y: auto; 
    max-height: 380px; 
  }
  
  .empresa-item { 
    padding: 12px 16px; 
    border: 1px solid var(--border); 
    border-radius: 8px; 
    background: var(--bg-page); 
  }
  
  .empresa-nombre { 
    font-size: 14px; 
    font-weight: 600; 
    color: var(--text-primary); 
  }
  
  .empty-msg { 
    font-size: 13px; 
    color: var(--text-disabled); 
    font-style: italic; 
    margin: 0; 
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

  @media (max-width: 768px) {
    .split-layout { 
      grid-template-columns: 1fr; 
    }
    .panel-pdf { 
      height: 300px; 
      border-right: none; 
      border-bottom: 1px solid var(--border); 
    }
    .empresas-layout { 
      grid-template-columns: 1fr; 
    }
  }
</style>