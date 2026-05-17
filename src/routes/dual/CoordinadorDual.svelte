<script>
  import { onMount } from 'svelte'
  import { navigate, useLocation } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated, isAgenteDual } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/Navbar.svelte'
  import FiltrosBarra from '../../lib/components/FiltrosBarra.svelte'
  import { formatFecha, estadoBadgeClass } from '../../lib/utils.js'

  const location = useLocation()

  // ── Estado de vistas ───────────────────────────────────────────────────────
  let vista = 'bandeja'

  // Hacemos que la vista reaccione a los clicks en la barra lateral
  $: {
    const queryVista = new URLSearchParams($location.search).get('vista') === 'empresas' ? 'empresas' : 'bandeja';
    if (queryVista === 'empresas' && vista !== 'empresas') {
      vista = 'empresas';
      cargarEmpresas();
    } else if (queryVista === 'bandeja' && vista === 'empresas') {
      vista = 'bandeja';
      cargarReportes();
    }
  }

  // ── Bandeja ────────────────────────────────────────────────────────────────
  let reportes           = []
  let loading            = true
  let error              = ''
  let filtroEstado       = 'Pendiente'
  let filtroBusqueda     = ''
  let filtroCarrera      = ''
  let filtroGrupo        = ''

  // Generamos la lista de grupos dinámicamente basados en los reportes cargados
  $: grupos = [...new Set(reportes.map(r => r.nomenclatura).filter(Boolean))].sort();

  $: reportesFiltrados = reportes.filter(r => {
    const matchBusqueda = filtroBusqueda.trim()
      ? r.matricula.toLowerCase().includes(filtroBusqueda.toLowerCase()) || (r.nombre && r.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()))
      : true;
    const matchCarrera = filtroCarrera ? (r.carrera && r.carrera.toLowerCase() === filtroCarrera.toLowerCase()) : true;
    const matchGrupo = filtroGrupo ? (r.nomenclatura && r.nomenclatura.toLowerCase() === filtroGrupo.toLowerCase()) : true;
    const matchEstado = filtroEstado ? r.estado === filtroEstado : true;
    return matchBusqueda && matchCarrera && matchGrupo && matchEstado;
  });

  // ── Revisión ───────────────────────────────────────────────────────────────
  let seleccionado = null
  let accion       = ''
  let nota         = ''
  let enviando     = false
  let exito        = ''
  let errorAccion  = ''

  // ── Empresas y asignaciones ────────────────────────────────────────────────
  let empresas            = []
  let loadingEmpresas     = false
  let nuevaEmpresa        = ''
  let empresaSeleccionada = ''
  let matriculaBusqueda   = ''
  let alumnoPreview       = null
  let loadingPreview      = false
  let errorAsignacion     = ''
  let exitoAsignacion     = ''
  let guardandoAsignacion = false

  // ── Guard ──────────────────────────────────────────────────────────────────
  onMount(() => {
    if (!get(isAuthenticated) || !get(isAgenteDual)) {
      navigate('/login', { replace: true })
      return
    }
    const initialVista = new URLSearchParams(window.location.search).get('vista') === 'empresas' ? 'empresas' : 'bandeja';
    vista = initialVista;
    if (vista === 'empresas') cargarEmpresas();
    else cargarReportes();
  })

  // ── Bandeja ────────────────────────────────────────────────────────────────
  async function cargarReportes() {
    loading = true
    error   = ''
    try {
      const params = new URLSearchParams()
      if (filtroEstado)       params.append('estado',       filtroEstado)
    
      const data    = await api.dual.listarReportes(params.toString())
      reportes      = data
    } catch (e) {
      error = e.message || 'Error al cargar reportes.'
    } finally {
      loading = false
    }
  }

  function abrirRevision(reporte) {
    seleccionado = reporte
    accion       = ''
    nota         = ''
    exito        = ''
    errorAccion  = ''
    vista        = 'revision'
  }

  function volverBandeja() {
    seleccionado = null
    vista        = 'bandeja'
    cargarReportes()
  }

  async function enviarDecision() {
    if (!accion) { errorAccion = 'Selecciona una acción.'; return }
    if (accion === 'rechazar' && !nota.trim()) {
      errorAccion = 'Escribe una nota al rechazar.'
      return
    }
    enviando    = true
    errorAccion = ''
    exito       = ''
    try {
      const body = { estado: accion === 'aprobar' ? 'Aprobada' : 'Rechazada' }
      if (nota.trim()) body.nota_agente = nota.trim()
      await api.dual.revisarReporte(seleccionado.id, body)
      exito = accion === 'aprobar'
        ? 'Reporte aprobado correctamente.'
        : 'Reporte rechazado. El alumno podrá reenviar.'
      seleccionado = {
        ...seleccionado,
        estado:      accion === 'aprobar' ? 'Aprobada' : 'Rechazada',
        nota_agente: nota.trim() || seleccionado.nota_agente,
      }
    } catch (e) {
      errorAccion = e.message || 'Error al enviar la decisión.'
    } finally {
      enviando = false
    }
  }

  // ── Empresas ───────────────────────────────────────────────────────────────
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

  async function buscarAlumno() {
    if (!matriculaBusqueda.trim()) return
    loadingPreview  = true
    alumnoPreview   = null
    errorAsignacion = ''
    try {
      alumnoPreview       = await api.dual.buscarAlumno(matriculaBusqueda.trim())
      empresaSeleccionada = alumnoPreview.empresa_id || ''
    } catch {
      errorAsignacion = 'Alumno no encontrado.'
    } finally {
      loadingPreview = false
    }
  }

  async function crearEmpresa() {
    if (!nuevaEmpresa.trim()) return
    try {
      const emp           = await api.dual.crearEmpresa({ nombre: nuevaEmpresa.trim() })
      empresas            = [...empresas, emp]
      empresaSeleccionada = emp.id
      nuevaEmpresa        = ''
    } catch (e) {
      errorAsignacion = e.message || 'Error al crear la empresa.'
    }
  }

  async function guardarAsignacion() {
    errorAsignacion = ''
    exitoAsignacion = ''
    if (!alumnoPreview)       { errorAsignacion = 'Busca un alumno primero.'; return }
    if (!empresaSeleccionada) { errorAsignacion = 'Selecciona una empresa.'; return }
    guardandoAsignacion = true
    try {
      await api.dual.actualizarAlumnoDual(alumnoPreview.matricula, {
        alumno_dual: true,
        empresa_id:  empresaSeleccionada,
      })
      exitoAsignacion = 'Alumno dual actualizado correctamente.'
      alumnoPreview = {
        ...alumnoPreview,
        es_alumno_dual: true,
        empresa_id:     empresaSeleccionada,
        empresa:        empresas.find(e => e.id === empresaSeleccionada)?.nombre,
      }
    } catch (e) {
      errorAsignacion = e.message || 'Error al guardar la asignación.'
    } finally {
      guardandoAsignacion = false
    }
  }

  async function quitarDual() {
    if (!alumnoPreview) return
    guardandoAsignacion = true
    errorAsignacion     = ''
    exitoAsignacion     = ''
    try {
      await api.dual.actualizarAlumnoDual(alumnoPreview.matricula, { alumno_dual: false })
      exitoAsignacion = 'Rol dual removido correctamente.'
      alumnoPreview   = { ...alumnoPreview, es_alumno_dual: false, activo: false }
    } catch (e) {
      errorAsignacion = e.message || 'Error al quitar el rol dual.'
    } finally {
      guardandoAsignacion = false
    }
  }

  // Diccionario para mapear el nombre largo de la carrera
  const nombresCarreras = {
    "TII": "Ingeniería en Tecnologías de la Información e Innovación Digital"
  };

  $: carreraCompletaRevision = seleccionado ? (nombresCarreras[seleccionado.carrera] || seleccionado.carrera) : '—';
  $: carreraCompletaPreview = alumnoPreview ? (nombresCarreras[alumnoPreview.carrera] || alumnoPreview.carrera) : '—';
</script>

<Navbar />

<div class="main-content">

  {#if vista === 'bandeja'}
    <div class="page-wrap">
      <div class="page-header">
        <h1 class="page-title">Bandeja de reportes duales</h1>
        <p class="page-sub">Revisión semanal de entregas de alumnos DUAL</p>
      </div>

      <FiltrosBarra
        mostrarCarrera={true}
        mostrarGrupo={true}
        mostrarEstado={true}
        {grupos}
        bind:filtroEstado
        bind:filtroBusqueda
        bind:filtroCarrera
        bind:filtroGrupo
        on:buscar={cargarReportes}
      />

      {#if loading}
        <div class="state-msg">Cargando reportes…</div>
      {:else if error}
        <p class="error-msg">{error}</p>
      {:else if reportesFiltrados.length === 0}
        <div class="state-msg empty">
          <span class="empty-icon">📭</span>
          <p>No hay reportes con los filtros seleccionados.</p>
        </div>
      {:else}
        <div class="table-wrap">
          <table class="reporte-table">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Nombre</th>
                <th>Calificación</th>
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
                  <td><span class={estadoBadgeClass(r.estado)}>{r.estado}</span></td>
                  <td class="td-fecha">{formatFecha(r.created_at)}</td>
                  <td>
                    <button class="btn-revisar" on:click={() => abrirRevision(r)}>
                      {r.estado === 'Pendiente' ? 'Revisar →' : 'Ver →'}
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <p class="count-label">{reportesFiltrados.length} reporte{reportesFiltrados.length !== 1 ? 's' : ''}</p>
      {/if}
    </div>

  {:else if vista === 'revision' && seleccionado}
    <div class="revision-wrap">
      <div class="revision-topbar">
        <button class="btn-back" on:click={volverBandeja}>← Volver a bandeja</button>
        <span class={estadoBadgeClass(seleccionado.estado)}>{seleccionado.estado}</span>
      </div>

      <div class="split-layout">
        <div class="panel-pdf">
          <div class="panel-label">Reporte entregado</div>
          {#if seleccionado.archivo_pdf_url}
            <iframe src={seleccionado.archivo_pdf_url} title="Reporte PDF" class="pdf-iframe"></iframe>
            <a href={seleccionado.archivo_pdf_url} target="_blank" rel="noopener noreferrer" class="link-externo">
              Abrir en nueva pestaña ↗
            </a>
          {:else}
            <div class="no-pdf">No hay PDF disponible.</div>
          {/if}
        </div>

        <div class="panel-acciones">
          <div class="panel-label">Decisión del agente</div>

          <div class="dato-cal">
            <p class="dato-label">Calificación declarada</p>
            <p class="dato-valor">{seleccionado.calificacion_alumno}</p>
          </div>

          <div class="ficha-alumno">
            <p class="ficha-titulo">Datos del alumno</p>
            <div class="ficha-grid">
              <span class="ficha-key">Nombre</span>
              <span class="ficha-val">{seleccionado.nombre || '—'}</span>
              <span class="ficha-key">Matrícula</span>
              <span class="ficha-val ficha-mono">{seleccionado.matricula}</span>
              <span class="ficha-key">Carrera</span>
              <span class="ficha-val">{carreraCompletaRevision}</span>
              <span class="ficha-key">Empresa</span>
              <span class="ficha-val">{seleccionado.empresa || 'Sin asignar'}</span>
              <span class="ficha-key">Grupo</span>
              <span class="ficha-val">{seleccionado.nomenclatura || seleccionado.cuatrimestre || '—'}</span>
              <span class="ficha-key">Semana</span>
              <span class="ficha-val">Semana {seleccionado.semana}</span>
              <span class="ficha-key">Entregado</span>
              <span class="ficha-val">{formatFecha(seleccionado.created_at)}</span>
            </div>
          </div>

          {#if seleccionado.nota_agente}
            <div class="nota-previa">
              <p class="dato-label">Nota del agente</p>
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
                >✅ Aprobar</button>
                <button
                  class="btn-decision btn-rechazar"
                  class:activo={accion === 'rechazar'}
                  on:click={() => accion = 'rechazar'}
                >❌ Rechazar</button>
              </div>

              {#if accion === 'rechazar' || accion === 'aprobar'}
                <div style="margin-top:12px">
                  <textarea
                    class="input-plain textarea-nota"
                    placeholder={accion === 'rechazar'
                      ? 'Razón del rechazo (obligatorio)…'
                      : 'Nota opcional para el alumno…'}
                    rows="3"
                    bind:value={nota}
                  ></textarea>
                </div>
              {/if}

              {#if errorAccion}<p class="error-msg" style="margin-top:10px">{errorAccion}</p>{/if}
              {#if exito}<p class="exito-msg">{exito}</p>{/if}

              {#if !exito}
                <button
                  class="btn-primary"
                  style="width:100%;margin-top:14px"
                  on:click={enviarDecision}
                  disabled={enviando || !accion}
                >
                  {enviando ? 'Enviando…' : 'Confirmar decisión'}
                </button>
              {:else}
                <button class="btn-outline" style="width:100%;margin-top:10px" on:click={volverBandeja}>
                  ← Volver a la bandeja
                </button>
              {/if}
            </div>
          {:else}
            <div class="ya-revisado">
              <p>Este reporte ya fue
                <strong
                  class:text-verde={seleccionado.estado === 'Aprobada'}
                  class:text-rojo={seleccionado.estado === 'Rechazada'}
                >{seleccionado.estado.toLowerCase()}</strong>.
              </p>
              <button class="btn-outline" style="margin-top:12px;width:100%" on:click={volverBandeja}>
                ← Volver a la bandeja
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>

  {:else if vista === 'empresas'}
    <div class="page-wrap">
      <div class="page-header">
        <h1 class="page-title">Gestión de alumnos duales</h1>
        <p class="page-sub">Asigna empresas y roles a alumnos duales</p>
      </div>

      {#if loadingEmpresas}
        <div class="state-msg">Cargando...</div>
      {:else}
        <div class="empresas-layout">
          <div class="card-seccion">
            <h2 class="seccion-title">Buscar alumno</h2>

            {#if errorAsignacion}<div class="error-msg">{errorAsignacion}</div>{/if}
            {#if exitoAsignacion}<div class="exito-msg">{exitoAsignacion}</div>{/if}

            <div class="nueva-empresa-row">
              <input
                class="input-plain"
                placeholder="Matrícula del alumno"
                bind:value={matriculaBusqueda}
                on:keydown={(e) => e.key === 'Enter' && buscarAlumno()}
              />
              <button class="btn-outline" style="white-space:nowrap" on:click={buscarAlumno} disabled={loadingPreview}>
                {loadingPreview ? '...' : 'Buscar'}
              </button>
            </div>

            {#if alumnoPreview}
              <div class="ficha-alumno" style="margin:0">
                <p class="ficha-titulo">Datos del alumno</p>
                <div class="ficha-grid">
                  <span class="ficha-key">Nombre</span>
                  <span class="ficha-val">{alumnoPreview.nombre}</span>
                  <span class="ficha-key">Carrera</span>
                  <span class="ficha-val">{carreraCompletaPreview}</span>
                  <span class="ficha-key">Grupo</span>
                  <span class="ficha-val">{alumnoPreview.nomenclatura || '—'}</span>
                  <span class="ficha-key">Es dual</span>
                  <span class="ficha-val">{alumnoPreview.es_alumno_dual ? '✅ Sí' : '❌ No'}</span>
                  <span class="ficha-key">Empresa</span>
                  <span class="ficha-val">{alumnoPreview.empresa || 'Sin asignar'}</span>
                </div>
              </div>

              <div class="field">
                <label>Empresa</label>
                <select class="input-plain" bind:value={empresaSeleccionada}>
                  <option value="">Selecciona una empresa</option>
                  {#each empresas as emp}
                    <option value={emp.id}>{emp.nombre}</option>
                  {/each}
                </select>
              </div>

              <div class="nueva-empresa-row">
                <input
                  class="input-plain"
                  placeholder="O escribe una empresa nueva..."
                  bind:value={nuevaEmpresa}
                  on:keydown={(e) => e.key === 'Enter' && crearEmpresa()}
                />
                <button class="btn-outline" style="white-space:nowrap" on:click={crearEmpresa} disabled={!nuevaEmpresa.trim()}>
                  + Agregar
                </button>
              </div>

              <div style="display:flex;gap:8px;margin-top:4px">
                <button
                  class="btn-primary"
                  style="flex:1"
                  on:click={guardarAsignacion}
                  disabled={guardandoAsignacion || !empresaSeleccionada}
                >
                  {guardandoAsignacion ? 'Guardando...' : alumnoPreview.es_alumno_dual ? 'Actualizar empresa' : 'Activar como dual'}
                </button>
                {#if alumnoPreview.es_alumno_dual}
                  <button
                    class="btn-outline btn-danger"
                    style="flex:1"
                    on:click={quitarDual}
                    disabled={guardandoAsignacion}
                  >
                    Quitar dual
                  </button>
                {/if}
              </div>
            {/if}
          </div>

          <div class="card-seccion">
            <h2 class="seccion-title">Empresas registradas</h2>
            {#if empresas.length === 0}
              <p class="empty-msg">No hay empresas registradas aún.</p>
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
  .main-content { padding-top: 56px; }
  .page-wrap    { padding: 2rem 1.5rem; max-width: 900px; margin: 0 auto; }
  .page-header  { margin-bottom: 1.5rem; }
  .page-title   { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
  .page-sub     { font-size: 0.875rem; color: var(--text-secondary); margin: 0; }

  /* Tabla */
  .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-card); background: var(--bg-card); }
  .reporte-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  .reporte-table thead { background: var(--bg-page); }
  .reporte-table th { text-align: left; padding: 10px 16px; font-weight: 600; color: var(--text-secondary); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); white-space: nowrap; }
  .reporte-table td { padding: 13px 16px; color: var(--text-primary); border-bottom: 1px solid var(--border); }
  .reporte-table tbody tr:last-child td { border-bottom: none; }
  .reporte-table tbody tr:hover         { background: var(--orange-light); }
  .row-pendiente { border-left: 3px solid var(--orange); }

  .td-matricula { font-family: monospace; font-weight: 600; letter-spacing: 0.03em; white-space: nowrap; }
  .td-nombre    { font-weight: 500; }
  .td-cal       { font-weight: 700; color: var(--orange); font-size: 1rem; }
  .td-fecha     { color: var(--text-secondary); font-size: 0.82rem; white-space: nowrap; }

  .btn-revisar { background: none; border: 1px solid var(--border); border-radius: 8px; padding: 5px 14px; font-size: 0.82rem; font-weight: 600; color: var(--orange); cursor: pointer; white-space: nowrap; transition: background 0.15s, border-color 0.15s; }
  .btn-revisar:hover { background: var(--orange-light); border-color: var(--orange); }

  .count-label { font-size: 0.8rem; color: var(--text-secondary); margin: 10px 0 0; text-align: right; }
  .state-msg   { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); font-size: 0.9rem; }
  .empty       { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .empty-icon  { font-size: 2rem; }

  /* Vista revisión */
  .revision-wrap   { display: flex; flex-direction: column; height: calc(100vh - 56px); overflow: hidden; }
  .revision-topbar { display: flex; align-items: center; gap: 12px; padding: 10px 20px; background: var(--bg-card); border-bottom: 1px solid var(--border); }
  .btn-back { background: none; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 600; color: var(--orange); padding: 0; }
  .btn-back:hover { text-decoration: underline; }
  .split-layout { display: grid; grid-template-columns: 1fr 340px; flex: 1; overflow: hidden; }
  .panel-pdf { display: flex; flex-direction: column; border-right: 1px solid var(--border); overflow: hidden; }
  .panel-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-secondary); padding: 9px 16px; border-bottom: 1px solid var(--border); background: var(--bg-page); }
  .pdf-iframe  { flex: 1; width: 100%; border: none; background: #fff; }
  .link-externo { display: block; padding: 7px 16px; font-size: 0.78rem; color: var(--orange); text-decoration: none; border-top: 1px solid var(--border); background: var(--bg-card); }
  .link-externo:hover { text-decoration: underline; }
  .no-pdf { display: flex; align-items: center; justify-content: center; flex: 1; color: var(--text-secondary); font-size: 0.875rem; }
  .panel-acciones { display: flex; flex-direction: column; overflow-y: auto; background: var(--bg-card); }

  .dato-cal { margin: 16px 16px 0; padding: 14px 16px; background: var(--orange-light); border: 1px solid #FED7AA; border-radius: 10px; }
  .dato-label { font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.05em; }
  .dato-valor { font-size: 2.25rem; font-weight: 800; color: var(--orange); margin: 0; line-height: 1; }

  .ficha-alumno { margin: 12px 16px 0; padding: 14px 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-page); }
  .ficha-titulo { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin: 0 0 10px; }
  .ficha-grid   { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; align-items: baseline; }
  .ficha-key    { font-size: 0.78rem; color: var(--text-secondary); white-space: nowrap; }
  .ficha-val    { font-size: 0.85rem; font-weight: 500; color: var(--text-primary); }
  .ficha-mono   { font-family: monospace; letter-spacing: 0.03em; }

  .nota-previa { margin: 12px 16px 0; padding: 12px 14px; background: var(--orange-light); border: 1px solid #FED7AA; border-radius: 10px; }
  .nota-texto { font-size: 0.85rem; color: var(--text-primary); margin: 4px 0 0; line-height: 1.5; }

  .acciones-grupo { padding: 14px 16px 20px; }
  .btn-decision-row { display: flex; gap: 8px; }
  .btn-decision { flex: 1; padding: 11px 8px; border-radius: 10px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.15s; border: 2px solid transparent; text-align: center; }
  .btn-aprobar         { background: #F0FDF4; color: #15803D; border-color: #BBF7D0; }
  .btn-aprobar:hover, .btn-aprobar.activo  { background: #DCFCE7; border-color: #4ADE80; }
  .btn-rechazar        { background: #FEF2F2; color: #B91C1C; border-color: #FECACA; }
  .btn-rechazar:hover, .btn-rechazar.activo { background: #FEE2E2; border-color: #F87171; }
  .textarea-nota { width: 100%; min-height: 80px; resize: vertical; box-sizing: border-box; }

  .exito-msg { color: #15803D; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 10px 14px; font-size: 0.875rem; margin-top: 12px; }
  .ya-revisado { padding: 16px; font-size: 0.9rem; color: var(--text-secondary); }
  .text-verde  { color: #15803D; }
  .text-rojo   { color: #B91C1C; }
  .btn-danger { color: #B91C1C; border-color: #FECACA; }
  .btn-danger:hover { background: #FEF2F2; border-color: #F87171; }

  /* Empresas */
  .empresas-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 8px; }
  .card-seccion { background: var(--bg-card); border-radius: var(--radius-card); box-shadow: var(--shadow-card); padding: 24px 28px; display: flex; flex-direction: column; gap: 14px; border: 1px solid var(--border); }
  .seccion-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0; }
  .field         { display: flex; flex-direction: column; gap: 6px; }
  .field label   { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .nueva-empresa-row { display: flex; gap: 8px; align-items: center; }
  .empresa-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; max-height: 400px; }
  .empresa-item   { padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-page); }
  .empresa-nombre { font-size: 14px; font-weight: 500; color: var(--text-primary); }
  .empty-msg      { font-size: 0.9rem; color: var(--text-secondary); margin: 0; }

  @media (max-width: 640px) {
    .split-layout    { grid-template-columns: 1fr; }
    .empresas-layout { grid-template-columns: 1fr; }
  }
</style>