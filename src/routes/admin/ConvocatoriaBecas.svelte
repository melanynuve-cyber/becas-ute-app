<script>
  // src/routes/admin/ConvocatoriaBecas.svelte
  // Panel de gestión de convocatorias de becas
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated, isCoordinadorBecas } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'
  import PageHeader from '../../lib/components/ui/PageHeader.svelte'
  import LoadingSpinner from '../../lib/components/ui/LoadingSpinner.svelte'
  import { formatFecha } from '../../lib/utils.js'

  let loading = true
  let error = ''
  let exito = ''
  let convocatoria = null

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const ANIO_ACTUAL = new Date().getFullYear()
  const ANIOS = Array.from({length: 5}, (_, i) => ANIO_ACTUAL + i)

  let mesInicio = ''
  let mesFin = ''
  let anioPeriodo = ANIO_ACTUAL
  let fechaCierre = ''
  let fechaLimiteDocumentos = ''
  let guardando = false
  let errorForm = ''

  onMount(async () => {
    if (!get(isAuthenticated) || !get(isCoordinadorBecas)) {
      navigate('/login', { replace: true })
      return
    }
    await cargar()
  })

  async function cargar() {
    loading = true
    error = ''
    try {
      convocatoria = await api.admin.convocatoriaActiva()
    } catch (e) {
      error = e.message || 'Error al cargar convocatoria.'
    } finally {
      loading = false
    }
  }

  const MESES_NUM = { Enero:1, Febrero:2, Marzo:3, Abril:4, Mayo:5, Junio:6, Julio:7, Agosto:8, Septiembre:9, Octubre:10, Noviembre:11, Diciembre:12 }

  function validarCuatrimestre(mesIni, mesFin) {
    let ni = MESES_NUM[mesIni]
    let nf = MESES_NUM[mesFin]
    if (nf <= ni) nf += 12 // cruce de año
    if (nf - ni < 4) {
      return `Un cuatrimestre debe tener al menos 4 meses. ${mesIni} a ${mesFin} solo tiene ${nf - ni} mes(es).`
    }
    return ''
  }

  async function abrirConvocatoria() {
    errorForm = ''
    if (!mesInicio) { errorForm = 'Selecciona el mes de inicio.'; return }
    if (!mesFin) { errorForm = 'Selecciona el mes de fin.'; return }
    if (!fechaCierre) { errorForm = 'Selecciona la fecha de cierre.'; return }

    const errCuat = validarCuatrimestre(mesInicio, mesFin)
    if (errCuat) { errorForm = errCuat; return }

    const periodo = `${mesInicio}-${mesFin} ${anioPeriodo}`

    guardando = true
    try {
      const body = { periodo, fecha_cierre: fechaCierre }
      if (fechaLimiteDocumentos) {
        body.fecha_limite_documentos = fechaLimiteDocumentos
      }
      await api.admin.crearConvocatoria(body)
      exito = `Convocatoria "${periodo}" abierta correctamente.`
      mesInicio = ''
      mesFin = ''
      anioPeriodo = ANIO_ACTUAL
      fechaCierre = ''
      fechaLimiteDocumentos = ''
      await cargar()
    } catch (e) {
      errorForm = e.message || 'Error al abrir convocatoria.'
    } finally {
      guardando = false
    }
  }

  async function cerrarConvocatoria() {
    if (!convocatoria?.id) return
    guardando = true
    error = ''
    exito = ''
    try {
      await api.admin.cerrarConvocatoria(convocatoria.id)
      exito = `Convocatoria "${convocatoria.periodo}" cerrada.`
      await cargar()
    } catch (e) {
      error = e.message || 'Error al cerrar convocatoria.'
    } finally {
      guardando = false
    }
  }
</script>

<svelte:head>
  <title>Convocatoria | Becas UTE</title>
</svelte:head>

<Navbar />
<main class="main">
  <div class="content">
    <PageHeader title="Gestión de Convocatorias" subtitle="Abrir y cerrar periodos de solicitud de becas" />

    {#if loading}
      <LoadingSpinner />
    {:else}
      {#if error}
        <div class="error-msg">{error}</div>
      {/if}
      {#if exito}
        <div class="exito-msg">{exito}</div>
      {/if}

      <!-- Estado actual -->
      <div class="card">
        <h2 class="card-title">Estado Actual</h2>
        {#if convocatoria && !convocatoria.cerrada}
          <div class="estado-activo">
            <span class="badge-activa">Abierta</span>
            <div class="estado-detalle">
              <div class="detalle-item">
                <span class="detalle-label">Periodo</span>
                <span class="detalle-valor">{convocatoria.periodo}</span>
              </div>
              <div class="detalle-item">
                <span class="detalle-label">Cierre de formularios</span>
                <span class="detalle-valor">{formatFecha(convocatoria.fecha_cierre)}</span>
              </div>
              {#if convocatoria.fecha_limite_documentos}
                <div class="detalle-item">
                  <span class="detalle-label">Fecha límite para documentos</span>
                  <span class="detalle-valor">{formatFecha(convocatoria.fecha_limite_documentos)}</span>
                </div>
              {/if}
            </div>
            <button class="btn-cierre-rojo" on:click={cerrarConvocatoria} disabled={guardando}>
              {guardando ? 'Cerrando...' : 'Cerrar Convocatoria'}
            </button>
          </div>
        {:else}
          <div class="estado-inactivo">
            <span class="badge-cerrada">Cerrada</span>
            <p class="estado-mensaje">
              No hay convocatoria activa. Los alumnos no pueden enviar solicitudes.
            </p>
          </div>
        {/if}
      </div>

      <!-- Abrir nueva convocatoria -->
      {#if !convocatoria || convocatoria.cerrada}
        <div class="card">
          <h2 class="card-title">Abrir Nueva Convocatoria</h2>
          {#if errorForm}
            <div class="error-msg">{errorForm}</div>
          {/if}
          <div class="form-row">
            <div class="field">
              <label>Mes de inicio</label>
              <select class="input-plain" bind:value={mesInicio}>
                <option value="">Selecciona...</option>
                {#each MESES as mes}
                  <option value={mes}>{mes}</option>
                {/each}
              </select>
            </div>
            <div class="field">
              <label>Mes de fin</label>
              <select class="input-plain" bind:value={mesFin}>
                <option value="">Selecciona...</option>
                {#each MESES as mes}
                  <option value={mes}>{mes}</option>
                {/each}
              </select>
            </div>
            <div class="field">
              <label>Año</label>
              <select class="input-plain" bind:value={anioPeriodo}>
                {#each ANIOS as anio}
                  <option value={anio}>{anio}</option>
                {/each}
              </select>
            </div>
            <div class="field">
              <label>Fecha de cierre de formularios</label>
              <input class="input-plain" type="datetime-local" bind:value={fechaCierre} />
            </div>
            <div class="field">
              <label>Fecha límite para documentos <span style="font-weight:400;color:var(--text-disabled)">(opcional)</span></label>
              <input class="input-plain" type="datetime-local" bind:value={fechaLimiteDocumentos} />
              <span style="font-size:11px;color:var(--text-secondary)">Los alumnos podrán subir documentos pendientes hasta esta fecha.</span>
            </div>
            <button class="btn-primary" style="align-self: flex-end;" on:click={abrirConvocatoria} disabled={guardando}>
              {guardando ? 'Abriendo...' : 'Abrir Convocatoria'}
            </button>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</main>

<style>
  .main { padding-top: 56px; min-height: 100vh; background: var(--bg-page); }
  .content { max-width: 700px; margin: 0 auto; padding: 40px 24px; display: flex; flex-direction: column; gap: 24px; }
  .card { background: var(--bg-card); border-radius: var(--radius-card); border: 1px solid var(--border); box-shadow: var(--shadow-card); padding: 28px; display: flex; flex-direction: column; gap: 16px; }
  .card-title { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0; }

  .estado-activo { display: flex; flex-direction: column; gap: 14px; }
  .badge-activa { display: inline-block; background: rgba(34, 197, 94, 0.1); color: var(--success); font-weight: 700; font-size: 13px; padding: 4px 14px; border-radius: 20px; border: 1px solid rgba(34, 197, 94, 0.2); align-self: flex-start; }
  .badge-cerrada { display: inline-block; background: rgba(239, 68, 68, 0.08); color: var(--error); font-weight: 700; font-size: 13px; padding: 4px 14px; border-radius: 20px; border: 1px solid rgba(239, 68, 68, 0.2); align-self: flex-start; }
  .estado-detalle { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .detalle-item { display: flex; flex-direction: column; gap: 4px; }
  .detalle-label { font-size: 11px; font-weight: 600; color: var(--text-disabled); text-transform: uppercase; }
  .detalle-valor { font-size: 15px; font-weight: 600; color: var(--text-primary); }
  .estado-inactivo { display: flex; flex-direction: column; gap: 8px; }
  .estado-mensaje { font-size: 14px; color: var(--text-secondary); line-height: 1.5; margin: 0; }

  .btn-cierre-rojo { background: var(--error); color: white; border: none; border-radius: 8px; padding: 12px 20px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: var(--font); align-self: flex-start; transition: background 0.15s; }
  .btn-cierre-rojo:hover { background: #dc2626; }
  .btn-cierre-rojo:disabled { opacity: 0.5; cursor: not-allowed; }

  .form-row { display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap; }
  .field { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 200px; }
  .field label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }

  .error-msg { font-size: 13px; color: var(--error); background: rgba(239,68,68,0.06); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(239,68,68,0.15); }
  .exito-msg { font-size: 13px; color: var(--success); background: rgba(34,197,94,0.06); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(34,197,94,0.15); }

  @media (max-width: 768px) {
    .content { padding: 24px 16px; }
    .card { padding: 20px; }
    .estado-detalle { grid-template-columns: 1fr; }
    .btn-cierre-rojo { width: 100%; justify-content: center; }
    .form-row { flex-direction: column; }
    .field { min-width: 0; }
  }
</style>
