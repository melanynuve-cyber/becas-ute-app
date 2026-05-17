<script>
  // src/routes/solicitud/DetalleSolicitud.svelte
  // Importaciones
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'
  import PerfilModal from '../../lib/components/layout/PerfilModal.svelte'
  import { estadoBadgeClass, estadoLabel } from '../../lib/utils.js'

  export let id

  // Variables de estado
  let showPerfil = false
  let solicitud  = null
  let loading    = true
  let error      = ''
  let alumno     = null

  // Catálogos
  const tiposBeca = [
    { key: 'academica',     label: 'A. Académica' },
    { key: 'deportiva',     label: 'B. Deportiva' },
    { key: 'cultural',      label: 'C. Cultural' },
    { key: 'alimentos',     label: 'D. Alimentos' },
    { key: 'transporte',    label: 'E. Transporte' },
    { key: 'empleado_hijo', label: 'F. Empleado y/o hijo de empleado' },
  ]

  const nombresDocumentos = {
    kardex:                  'Kárdex',
    recibo_ingresos:         'Recibo de Ingresos',
    recibo_servicio_publico: 'Recibo de Servicio Público',
    recibo_inscripcion:      'Comprobante de Inscripción',
  }

  // Carga inicial
  onMount(async () => {
    if (!get(isAuthenticated)) {
      navigate('/login', { replace: true })
      return
    }
    try {
      const [sol, alum] = await Promise.all([
        api.solicitudes.detalle(id),
        api.alumno.me(),
      ])
      solicitud = sol
      alumno    = alum
    } catch {
      error = 'No se pudo cargar la solicitud.'
    } finally {
      loading = false
    }
  })

  // Manejo de comprobante de inscripción
  let subiendoInscripcion = false
  let errorInscripcion    = ''
  let exitoInscripcion    = false

  async function onArchivoInscripcion(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      errorInscripcion = 'Solo se aceptan archivos PDF'
      return
    }
    errorInscripcion    = ''
    subiendoInscripcion = true
    try {
      const fd = new FormData()
      fd.append('recibo_inscripcion', file)
      await api.solicitudes.subirInscripcion(id, fd)
      solicitud        = { ...solicitud, documentos: { ...docs, recibo_inscripcion: file.name } }
      exitoInscripcion = true
    } catch (e) {
      errorInscripcion = e.message || 'Error al subir el archivo'
    } finally {
      subiendoInscripcion = false
    }
  }

  // Variables reactivas
  $: p    = solicitud?.payload || {}
  $: d    = p.datos_personales  || {}
  $: b    = p.beca_solicitada   || {}
  $: info = p.informacion_general || {}
  $: ing  = p.ingreso_mensual   || {}
  $: egr  = p.egreso_mensual    || {}
  $: docs = solicitud?.documentos || {}
  $: inscripcionPendiente = docs.recibo_inscripcion === 'pendiente' && !exitoInscripcion

  $: fechaEnvio = solicitud
    ? new Date(solicitud.created_at).toLocaleDateString('es-MX', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : ''
</script>

<Navbar onAlumnoClick={() => showPerfil = true} />
<PerfilModal bind:show={showPerfil} {alumno} />

<div style="padding-top: 56px;">
  <div class="page">

    {#if loading}
      <div class="loading-wrap"><div class="spinner-lg"></div></div>

    {:else if error}
      <div class="error-msg">{error}</div>

    {:else if solicitud}

      <div class="top-bar">
        <button class="back-btn" on:click={() => navigate('/dashboard')}>
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
          Regresar
        </button>
        <span class={estadoBadgeClass(solicitud.estado)}>
          {estadoLabel(solicitud.estado)}
        </span>
      </div>

      <div class="form-card">
        <div class="preview-header">
          <div class="preview-icon">📄</div>
          <div>
            <h1 class="form-title">Solicitud de Beca Interna</h1>
            <p class="preview-sub">Enviada el {fechaEnvio}</p>
          </div>
        </div>

        <div class="preview-section">
          <h3 class="preview-section-title">Datos Personales</h3>
          <div class="preview-grid">
            <div class="preview-field"><span class="preview-label">Nombre(s)</span><span>{d.nombres || '—'}</span></div>
            <div class="preview-field"><span class="preview-label">Apellido Paterno</span><span>{d.apellido_paterno || '—'}</span></div>
            <div class="preview-field"><span class="preview-label">Apellido Materno</span><span>{d.apellido_materno || '—'}</span></div>
            <div class="preview-field"><span class="preview-label">Matrícula</span><span>{d.matricula || '—'}</span></div>
            <div class="preview-field"><span class="preview-label">Programa educativo</span><span>{d.programa_educativo || '—'}</span></div>
            <div class="preview-field"><span class="preview-label">Cuatrimestre a cursar</span><span>{d.cuatrimestre_a_cursar || '—'}</span></div>
            <div class="preview-field"><span class="preview-label">Turno</span><span>{d.turno === 'M' ? 'Matutino' : d.turno === 'V' ? 'Vespertino' : '—'}</span></div>
            <div class="preview-field"><span class="preview-label">Grupo</span><span>{d.grupo || '—'}</span></div>
            <div class="preview-field"><span class="preview-label">Domicilio</span><span>{d.domicilio_calle} {d.domicilio_numero}, {d.colonia}, {d.municipio}</span></div>
            <div class="preview-field"><span class="preview-label">Correo electrónico</span><span>{d.correo_electronico || '—'}</span></div>
            <div class="preview-field"><span class="preview-label">Estado civil</span><span>{d.estado_civil || '—'}</span></div>
            <div class="preview-field"><span class="preview-label">Edad</span><span>{d.edad || '—'}</span></div>
            <div class="preview-field"><span class="preview-label">Celular</span><span>{d.celular || '—'}</span></div>
            <div class="preview-field"><span class="preview-label">RFC</span><span>{d.rfc || '—'}</span></div>
            <div class="preview-field"><span class="preview-label">CURP</span><span>{d.curp || '—'}</span></div>
          </div>
        </div>

        <div class="preview-section">
          <h3 class="preview-section-title">Beca Solicitada</h3>
          <div class="preview-grid">
            <div class="preview-field">
              <span class="preview-label">Tipo de solicitud</span>
              <span>{b.tipo_solicitud || '—'}</span>
            </div>
            <div class="preview-field">
              <span class="preview-label">Tipos de beca</span>
              <span>
                {(b.tipos_beca || []).length > 0
                  ? b.tipos_beca.map(k => tiposBeca.find(t => t.key === k)?.label).join(', ')
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        <div class="preview-section">
          <h3 class="preview-section-title">Información General</h3>
          <div class="preview-grid">
            <div class="preview-field"><span class="preview-label">Promedio preparatoria</span><span>{info.promedio_preparatoria || '—'}</span></div>
            <div class="preview-field"><span class="preview-label">% beca cuatrimestre anterior</span><span>{info.porcentaje_beca_anterior || '—'}</span></div>
            <div class="preview-field"><span class="preview-label">Promedio cuatrimestre anterior</span><span>{info.promedio_cuatrimestre_anterior || '—'}</span></div>
            <div class="preview-field"><span class="preview-label">Otra beca</span><span>{info.otra_beca || '—'}</span></div>
          </div>
        </div>

        <div class="preview-section">
          <h3 class="preview-section-title">Ingreso Mensual</h3>
          <div class="preview-grid">
            <div class="preview-field"><span class="preview-label">Monto de ingreso</span><span>${ing.monto_ingreso || '0'}</span></div>
            <div class="preview-field"><span class="preview-label">Personas dependientes</span><span>{ing.numero_dependientes || '0'}</span></div>
          </div>
        </div>

        <div class="preview-section">
          <h3 class="preview-section-title">Egreso Mensual</h3>
          <div class="preview-grid">
            <div class="preview-field"><span class="preview-label">Alimentación</span><span>${egr.gastos_alimentacion || '0'}</span></div>
            <div class="preview-field"><span class="preview-label">Educación</span><span>${egr.gastos_educacion || '0'}</span></div>
            <div class="preview-field"><span class="preview-label">Renta / Hipoteca</span><span>${egr.gastos_renta_hipoteca || '0'}</span></div>
            <div class="preview-field"><span class="preview-label">Servicios</span><span>${egr.gastos_servicios || '0'}</span></div>
            <div class="preview-field"><span class="preview-label">Gastos varios</span><span>${egr.gastos_varios || '0'}</span></div>
            <div class="preview-field">
              <span class="preview-label"><strong>Total egresos</strong></span>
              <span><strong>${egr.total_egresos?.toFixed(2) || '0.00'}</strong></span>
            </div>
          </div>
        </div>

        <div class="preview-section">
          <h3 class="preview-section-title">Documentos Adjuntos</h3>
          <div class="docs-grid">
            {#each Object.entries(nombresDocumentos) as [key, nombre]}
              <div class="doc-item" class:doc-pendiente={key === 'recibo_inscripcion' && inscripcionPendiente}>
                <div class="doc-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span class="doc-nombre">{nombre}</span>
                  {#if key === 'recibo_inscripcion' && inscripcionPendiente}
                    <span class="badge-pendiente-doc">Pendiente</span>
                  {:else}
                    <span class="badge-ok-doc">✓</span>
                  {/if}
                </div>

                {#if key === 'recibo_inscripcion' && inscripcionPendiente}
                  <p class="doc-hint">Adjunta tu comprobante cuando esté disponible.</p>
                  {#if errorInscripcion}
                    <span class="error-inline">{errorInscripcion}</span>
                  {/if}
                  <label class="doc-upload-btn" class:disabled={subiendoInscripcion}>
                    {subiendoInscripcion ? 'Subiendo...' : 'Adjuntar PDF'}
                    <input
                      type="file"
                      accept=".pdf"
                      style="display:none"
                      disabled={subiendoInscripcion}
                      on:change={onArchivoInscripcion}
                    />
                  </label>
                {/if}
              </div>
            {/each}
          </div>
        </div>

      </div>
    {/if}
  </div>
</div>

<style>
  .page { max-width: 900px; margin: 0 auto; padding: 32px 16px 64px; display: flex; flex-direction: column; gap: 16px; }

  .loading-wrap { display: flex; justify-content: center; padding: 60px; }
  .spinner-lg {
    width: 36px; height: 36px;
    border: 3px solid var(--border); border-top-color: var(--orange);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .top-bar { display: flex; align-items: center; justify-content: space-between; }
  .back-btn {
    display: flex; align-items: center; gap: 8px;
    background: none; border: none; cursor: pointer;
    font-family: var(--font); font-size: 14px; font-weight: 600;
    color: var(--text-secondary); padding: 8px 0;
    transition: color 0.15s;
  }
  .back-btn:hover { color: var(--orange); }

  .form-card {
    background: var(--bg-card); border-radius: var(--radius-card);
    box-shadow: var(--shadow-card); padding: 32px 36px;
    display: flex; flex-direction: column; gap: 28px;
  }

  .preview-header { display: flex; align-items: center; gap: 16px; }
  .preview-icon {
    width: 48px; height: 48px; border-radius: 50%;
    background: var(--orange-light);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; flex-shrink: 0;
  }
  .form-title  { font-size: 22px; font-weight: 700; margin: 0; }
  .preview-sub { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }

  .preview-section       { display: flex; flex-direction: column; gap: 12px; }
  .preview-section-title {
    font-size: 15px; font-weight: 600; color: var(--text-primary);
    padding-bottom: 8px; border-bottom: 1.5px solid var(--border);
  }
  .preview-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
  .preview-field { display: flex; flex-direction: column; gap: 2px; }
  .preview-label { font-size: 12px; color: var(--text-secondary); }

  .docs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .doc-item {
    display: flex; flex-direction: column; gap: 8px; padding: 10px 14px;
    border: 1.5px solid var(--border); border-radius: var(--radius-input);
    background: var(--bg-page);
  }
  .doc-pendiente { border-color: var(--orange-mid); background: var(--orange-light); }
  .doc-header    { display: flex; align-items: center; gap: 10px; }
  .doc-nombre    { font-size: 13px; font-weight: 600; color: var(--text-primary); flex: 1; }

  .badge-pendiente-doc {
    font-size: 11px; font-weight: 600;
    background: #FEF3C7; color: #D97706;
    padding: 2px 8px; border-radius: 999px; white-space: nowrap;
  }
  .badge-ok-doc  { font-size: 12px; font-weight: 700; color: var(--success); }
  .doc-hint      { font-size: 12px; color: var(--text-secondary); margin: 0; }
  .error-inline  { font-size: 12px; color: var(--error); }

  .doc-upload-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px; background: var(--orange); color: white;
    border-radius: var(--radius-btn); font-family: var(--font);
    font-size: 13px; font-weight: 600; cursor: pointer; border: none;
    align-self: flex-start; transition: background 0.15s;
  }
  .doc-upload-btn:hover:not(.disabled) { background: var(--orange-hover); }
  .doc-upload-btn.disabled { opacity: 0.6; cursor: not-allowed; }

  @media (max-width: 640px) {
    .form-card    { padding: 20px 16px; }
    .preview-grid { grid-template-columns: 1fr; }
    .docs-grid    { grid-template-columns: 1fr; }
  }
</style>