<script>
  // src/routes/dual/CoordinadorCarrera.svelte
  // Importaciones desglosadas
  import { onMount } from 'svelte'
  import { navigate, useLocation } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { 
    isAuthenticated, 
    isCoordinadorCarrera 
  } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'
  import FiltrosBarra from '../../lib/components/shared/FiltrosBarra.svelte'
  import { formatFecha } from '../../lib/utils.js'

  const location = useLocation()
  let vista = 'directorio'

  // Sincronización reactiva: Escucha cambios en el Navbar
  $: {
    const queryVista = new URLSearchParams($location.search).get('vista')
    if (queryVista === 'grupos' && vista !== 'grupos') {
      vista = 'grupos'
    } else if (!queryVista && vista === 'grupos') {
      vista = 'directorio'
      cargarAlumnos()
    }
  }

  // Variables de control del directorio
  let alumnos = []
  let loading = true
  let error = ''
  let filtroCuatrimestre = ''
  let filtroGrupo = ''
  let filtroBusqueda = ''
  let filtroCarrera = ''
  let filtroEstado = ''

  // Variables de control de expediente
  let alumnoSeleccionado = null
  let reportes = []
  let loadingExpediente = false
  let errorExpediente = ''

  // Variables de control de gestión de grupos
  let formGrupo = {
    carrera: 'ING.NME TEC DE LA INFORMACIÓN E INNOVACION DIGITAL',
    siglas: 'TII',
    cuatrimestre: 5,
    modalidad: 'bis',
    letra: 'A',
    turno: 'Matutino'
  }
  let grupoCreado = null
  let guardandoGrupo = false
  let errorGrupo = ''
  
  let archivoCSV = null
  let subiendoCSV = false
  let errorCSV = ''
  let exitoCSV = ''

  onMount(async () => {
    if (!get(isAuthenticated) || !get(isCoordinadorCarrera)) {
      navigate('/login', { replace: true })
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
    const busqueda = filtroBusqueda.toLowerCase()
    const matchBusqueda = filtroBusqueda.trim()
      ? a.matricula.toLowerCase().includes(busqueda) || 
        a.nombre.toLowerCase().includes(busqueda)
      : true
      
    const carreraStr = filtroCarrera.toLowerCase()
    const matchCarrera = filtroCarrera
      ? (a.carrera && a.carrera.toLowerCase() === carreraStr) || 
        (a.nomenclatura && a.nomenclatura.toLowerCase().includes(carreraStr))
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
      const paramCuatri = filtroCuatrimestre || null
      reportes = await api.dual.expediente(alumno.matricula, paramCuatri)
    } catch (e) {
      errorExpediente = e.message || 'Error al cargar el expediente.'
    } finally {
      loadingExpediente = false
    }
  }

  // Función para volver al directorio de alumnos
  function volverDirectorio() {
    alumnoSeleccionado = null
    reportes = []
    vista = 'directorio'
    cargarAlumnos()
  }

  function descargarCSV(matricula) {
    const params = filtroCuatrimestre 
      ? `?cuatrimestre=${filtroCuatrimestre}` 
      : ''
    window.open(api.dual.exportarCSV(matricula) + params, '_blank')
  }

  // Cálculo del promedio del expediente
  $: promedioExpediente = reportes.length
    ? (reportes.reduce((s, r) => s + Number(r.calificacion_alumno), 0) / 
       reportes.length).toFixed(2)
    : null
    
  $: carreraCompletaExpediente = alumnoSeleccionado 
    ? alumnoSeleccionado.carrera 
    : '—'

  // Mutaciones de infraestructura de grupos
  async function registrarGrupo() {
    guardandoGrupo = true
    errorGrupo = ''
    grupoCreado = null
    try {
      const res = await api.dual.crearGrupo(formGrupo)
      grupoCreado = res.grupo
    } catch (e) {
      errorGrupo = e.message || 'Error de integridad al registrar grupo.'
    } finally {
      guardandoGrupo = false
    }
  }

  function descargarPlantillaCSV() {
    const header = "matricula,nombre\n"
    const mockRow = "302410000,Ejemplo Apellido"
    const csvContent = `data:text/csv;charset=utf-8,${header}${mockRow}`
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "plantilla_alumnos.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  let resultadoCSV = null // { insertados, errores: [] }

  // Validador local extraído de la versión de Claude
  function validarFilasCSV(texto) {
    const lineas = texto.trim().split('\n')
    if (lineas.length < 2) return { validas: [], errores: [{ fila: 0, razon: 'El archivo no contiene datos.' }] }

    const encabezado = lineas[0].toLowerCase().replace(/\r/, '')
    if (!encabezado.includes('matricula') || !encabezado.includes('nombre')) {
      return { validas: [], errores: [{ fila: 1, razon: 'Faltan columnas "matricula" y "nombre".' }] }
    }

    const validas = []
    const errores = []

    for (let i = 1; i < lineas.length; i++) {
      const fila = lineas[i].replace(/\r/, '').trim()
      if (!fila) continue

      const cols = fila.split(',')
      const matricula = (cols[0] || '').trim()
      const nombre = cols.slice(1).join(',').trim()

      if (!matricula && !nombre) continue

      const numFila = i + 1

      if (!/^\d+$/.test(matricula)) {
        errores.push({ fila: numFila, matricula, razon: 'Matrícula no numérica.' })
        continue
      }
      if (matricula.length !== 9) {
        errores.push({ fila: numFila, matricula, razon: 'Longitud inválida (deben ser 9).' })
        continue
      }
      if (!nombre) {
        errores.push({ fila: numFila, matricula, razon: 'Nombre vacío.' })
        continue
      }

      validas.push({ matricula, nombre })
    }

    return { validas, errores }
  }

  // Controlador de subida actualizado con transaccionalidad
  async function procesarCargaMasiva() {
    if (!archivoCSV || !grupoCreado) return
    subiendoCSV = true
    errorCSV = ''
    resultadoCSV = null

    try {
      const texto = await archivoCSV.text()
      const { validas, errores: errs } = validarFilasCSV(texto)

      // Bloquear si todo el lote viene corrupto
      if (errs.length > 0 && validas.length === 0) {
        resultadoCSV = { insertados: 0, errores: errs }
        return
      }

      const fd = new FormData()
      fd.append('file', archivoCSV)
      const respuesta = await api.dual.subirAlumnosCSV(grupoCreado.id, fd)

      resultadoCSV = {
        insertados: respuesta.insertados ?? validas.length,
        errores: errs
      }
      archivoCSV = null
      await cargarAlumnos()
    } catch (e) {
      errorCSV = e.message || 'Error de I/O al procesar el archivo.'
    } finally {
      subiendoCSV = false
    }
  }
</script>

<Navbar />

<div class="main-content">

  {#if vista === 'directorio'}
    <div class="page-wrap">
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
        <div class="state-msg"><div class="spinner"></div></div>
      {:else if error}
        <p class="error-msg">{error}</p>
      {:else if alumnosFiltrados.length === 0}
        <div class="state-msg empty">
          No hay alumnos duales con los filtros seleccionados.
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {#each alumnosFiltrados as a}
                <tr>
                  <td class="td-matricula">{a.matricula}</td>
                  <td class="td-nombre">{a.nombre}</td>
                  <td class="td-grupo">{a.nomenclatura || '—'}</td>
                  <td>{a.empresa || 'Sin asignar'}</td>
                  <td style="text-align: right;">
                    <button 
                      class="btn-ver" 
                      on:click={() => abrirExpediente(a)}
                    >
                      Ver Expediente
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>

  {:else if vista === 'grupos'}
    <div class="page-wrap">
      <div class="expediente-layout">
        <button class="btn-back" on:click={volverDirectorio}>
          Volver al directorio
        </button>
      </div>

      <div class="expediente-layout">
        <div class="reportes-card">
          <h2 class="card-title">Configuración de Estructura Académica</h2>
          
          {#if errorGrupo}
            <div class="error-msg">{errorGrupo}</div>
          {/if}

          <div class="grid-form">
            <div class="field">
              <label>Carrera Completa</label>
              <input 
                type="text" 
                class="input-plain" 
                bind:value={formGrupo.carrera} 
                disabled={grupoCreado} 
              />
            </div>
            <div class="field">
              <label>Siglas</label>
              <input 
                type="text" 
                class="input-plain" 
                bind:value={formGrupo.siglas} 
                disabled={grupoCreado} 
              />
            </div>
            <div class="field">
              <label>Cuatrimestre</label>
              <input 
                type="number" 
                class="input-plain" 
                min="1" 
                max="12" 
                bind:value={formGrupo.cuatrimestre} 
                disabled={grupoCreado} 
              />
            </div>
            <div class="field">
              <label>Modalidad</label>
              <select 
                class="input-plain" 
                bind:value={formGrupo.modalidad} 
                disabled={grupoCreado}
              >
                <option value="bis">BIS</option>
                <option value="intensivo">Intensivo</option>
                <option value="mixta">Mixta</option>
                <option value="despresurizada">Despresurizada</option>
              </select>
            </div>
            <div class="field">
              <label>Letra</label>
              <input 
                type="text" 
                class="input-plain" 
                maxlength="1" 
                bind:value={formGrupo.letra} 
                disabled={grupoCreado} 
              />
            </div>
            <div class="field">
              <label>Turno</label>
              <select 
                class="input-plain" 
                bind:value={formGrupo.turno} 
                disabled={grupoCreado}
              >
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Despresurizado">Despresurizado</option>
              </select>
            </div>
          </div>

          {#if !grupoCreado}
            <button 
              class="btn-primary" 
              style="margin-top:10px" 
              on:click={registrarGrupo} 
              disabled={guardandoGrupo}
            >
              {guardandoGrupo ? 'Registrando...' : 'Establecer Grupo'}
            </button>
          {:else}
            <div class="ficha-card card-static">
              <p class="ficha-titulo">
                Grupo Creado: <span class="highlight-orange">{grupoCreado.nomenclatura}</span>
              </p>
              <div class="ficha-divider"></div>
              <div class="csv-upload-section">
                <p class="csv-instructions">
                  Descarga la plantilla, llénala con los datos de control escolar y súbela para matricular a los alumnos en bloque.
                </p>
                <button 
                  class="btn-outline btn-mb" 
                  on:click={descargarPlantillaCSV}
                >
                  Descargar CSV Base
                </button>
                
                <input 
                  type="file" 
                  accept=".csv" 
                  on:change={(e) => { 
                    archivoCSV = e.target.files[0]; 
                    resultadoCSV = null; 
                    errorCSV = ''; 
                  }} 
                />

                {#if errorCSV}
                  <div class="error-msg" style="margin-top:10px;">{errorCSV}</div>
                {/if}

                {#if resultadoCSV}
                  <div style="margin-top:14px; padding:12px; border-radius:8px; background:var(--bg-page); border:1px solid var(--border);">
                    <p style="color:var(--success); font-weight:600; font-size:13px; margin:0;">
                      ✓ {resultadoCSV.insertados} alumnos procesados e insertados en la base de datos.
                    </p>
                    {#if resultadoCSV.errores.length > 0}
                      <p style="color:var(--error); font-weight:600; font-size:12px; margin:8px 0 4px;">
                        Excepciones detectadas (filas ignoradas):
                      </p>
                      <ul style="margin:0; padding-left:16px; font-size:12px; color:var(--text-secondary);">
                        {#each resultadoCSV.errores as err}
                          <li>
                            <strong>Fila {err.fila}</strong> {err.matricula ? `(${err.matricula})` : ''}: {err.razon}
                          </li>
                        {/each}
                      </ul>
                    {/if}
                  </div>
                {/if}

                <button 
                  class="btn-primary" 
                  style="margin-top:14px;" 
                  disabled={!archivoCSV || subiendoCSV} 
                  on:click={procesarCargaMasiva}
                >
                  {subiendoCSV ? 'Sincronizando lote...' : 'Ejecutar Carga Masiva'}
                </button>
              </div>
            </div>
          {/if}
        </div>
      </div>
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
            <span class="ficha-val ficha-mono">
              {alumnoSeleccionado.matricula}
            </span>
            <span class="ficha-key">Carrera</span>
            <span class="ficha-val">{carreraCompletaExpediente}</span>
            <span class="ficha-key">Grupo</span>
            <span class="ficha-val ficha-mono">
              {alumnoSeleccionado.nomenclatura || '—'}
            </span>
            <span class="ficha-key">Empresa</span>
            <span class="ficha-val bold-primary">
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
            <button 
              class="btn-primary" 
              on:click={() => descargarCSV(alumnoSeleccionado.matricula)}
            >
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
              <svg 
                width="32" 
                height="32" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="1.8" 
                viewBox="0 0 24 24"
              >
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
              {reportes.length} reporte{reportes.length !== 1 ? 's' : ''} 
              aprobado{reportes.length !== 1 ? 's' : ''}
            </p>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Mantenemos tus estilos originales */
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

  .header-flex {
    display: flex; 
    justify-content: space-between; 
    align-items: center;
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

  /* Nuevas clases para los componentes añadidos */
  .grid-form { 
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
    gap: 16px; 
  }

  .card-static {
    position: static;
    margin-top: 20px;
  }

  .highlight-orange {
    color: var(--orange);
  }

  .csv-upload-section {
    margin-top: 14px;
  }

  .csv-instructions {
    font-size: 13px; 
    color: var(--text-secondary); 
    margin-bottom: 12px;
  }

  .btn-mb {
    margin-bottom: 16px;
  }

  .mt-10 {
    margin-top: 10px;
  }

  .mt-14 {
    margin-top: 14px;
  }

  .bold-primary {
    color: var(--text-primary); 
    font-weight: 600;
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