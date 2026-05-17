// src/routes/admin/AdminDetalle.svelte
<script>
  // Importación de dependencias y componentes de navegación globales
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated, isAdmin, token } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'
  import { estadoBadgeClass, estadoLabel } from '../../lib/utils.js'

  // Propiedades recibidas del enrutador
  export let id

  // Variables de estado para el manejo de la solicitud y carga
  let solicitud = null
  let loading   = true
  let guardando = false
  let error     = ''
  let exito     = ''
  let nuevoEstado = ''

  // Opciones válidas para el cambio de estado administrativo
  const estadoOpciones = ['Pendiente', 'En_revision', 'Aprobada', 'Rechazada']

  // Catálogo de tipos de becas disponibles en la institución
  const tiposBeca = {
    academica:     'A. Académica',
    deportiva:     'B. Deportiva',
    cultural:      'C. Cultural',
    alimentos:     'D. Alimentos',
    transporte:    'E. Transporte',
    empleado_hijo: 'F. Empleado y/o hijo de empleado',
  }

  // Identificadores de los documentos requeridos en el expediente
  const nombresDoc = {
    kardex:                  'Kárdex',
    recibo_ingresos:         'Recibo de Ingresos',
    recibo_servicio_publico: 'Recibo de Servicio Público',
    recibo_inscripcion:      'Comprobante de Inscripción',
  }

  // Validación de sesión y rol de administrador al montar el componente
  onMount(async () => {
    if (!get(isAuthenticated) || !get(isAdmin)) {
      navigate('/login', { replace: true })
      return
    }
    try {
      solicitud   = await api.admin.detalle(id)
      nuevoEstado = solicitud.estado
    } catch {
      error = 'No se pudo cargar la solicitud'
    } finally {
      loading = false
    }
  })

  // Envío de la actualización del estado de la solicitud al backend
  async function guardarEstado() {
    guardando = true
    exito = ''
    error = ''
    try {
      await api.admin.cambiarEstado(id, nuevoEstado)
      solicitud.estado = nuevoEstado
      exito = 'Estado actualizado correctamente'
    } catch (e) {
      error = e.message
    } finally {
      guardando = false
    }
  }

  // Descarga y apertura segura de archivos PDF adjuntos desde el servidor
  async function abrirDoc(tipo) {
    error = ''
    try {
      const jwt     = get(token)
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const res = await fetch(`${BASE_URL}/admin/solicitudes/${id}/documento/${tipo}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      if (!res.ok) throw new Error('No se pudo cargar el documento')
      const blob = await res.blob()
      window.open(URL.createObjectURL(blob), '_blank')
    } catch (e) {
      error = e.message
    }
  }

  // Procesamiento reactivo del payload de la solicitud activa
  $: p = solicitud?.payload || {}
  $: d = p.datos_personales  || {}
</script>

<Navbar />

<main class="main">
  <div class="content">

    <div class="top-row">
      <button class="btn-back" on:click={() => navigate('/admin/solicitudes')}>← Volver</button>
      <h1 class="page-title">Detalle de Solicitud</h1>
    </div>

    {#if loading}
      <div class="loading-wrap"><div class="spinner-lg"></div></div>
    {:else if solicitud}

      <div class="card estado-card">
        <div class="estado-row">
          <div>
            <p class="field-label">Estado actual</p>
            <span class={estadoBadgeClass(solicitud.estado)}>
              {estadoLabel(solicitud.estado)}
            </span>
          </div>
          <div class="estado-change">
            <p class="field-label">Cambiar estado</p>
            <div class="estado-actions">
              <select class="select-estado" bind:value={nuevoEstado}>
                {#each estadoOpciones as op}
                  <option value={op}>{estadoLabel(op)}</option>
                {/each}
              </select>
              <button
                class="btn-primary"
                style="width:auto;padding:10px 20px"
                on:click={guardarEstado}
                disabled={guardando || nuevoEstado === solicitud.estado}
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
        {#if exito}<p class="msg-exito">{exito}</p>{/if}
        {#if error}<div class="error-msg">{error}</div>{/if}
      </div>

      <div class="card">
        <h2 class="section-title">Datos Personales</h2>
        <div class="grid-2">
          <div class="field"><span class="field-label">Matrícula</span><span>{solicitud.matricula}</span></div>
          <div class="field"><span class="field-label">Nombre(s)</span><span>{d.nombres}</span></div>
          <div class="field"><span class="field-label">Apellido Paterno</span><span>{d.apellido_paterno}</span></div>
          <div class="field"><span class="field-label">Apellido Materno</span><span>{d.apellido_materno}</span></div>
          <div class="field"><span class="field-label">Programa educativo</span><span>{d.programa_educativo}</span></div>
          <div class="field"><span class="field-label">Cuatrimestre a cursar</span><span>{d.cuatrimestre_a_cursar}</span></div>
          <div class="field"><span class="field-label">Turno</span><span>{d.turno === 'M' ? 'Matutino' : 'Vespertino'}</span></div>
          <div class="field"><span class="field-label">Grupo</span><span>{d.grupo}</span></div>
          <div class="field"><span class="field-label">Domicilio</span><span>{d.domicilio_calle} {d.domicilio_numero}, {d.colonia}, {d.municipio}</span></div>
          <div class="field"><span class="field-label">Correo electrónico</span><span>{d.correo_electronico}</span></div>
          <div class="field"><span class="field-label">Estado civil</span><span>{d.estado_civil}</span></div>
          <div class="field"><span class="field-label">Edad</span><span>{d.edad}</span></div>
          <div class="field"><span class="field-label">Celular</span><span>{d.celular}</span></div>
          <div class="field"><span class="field-label">RFC</span><span>{d.rfc}</span></div>
          <div class="field"><span class="field-label">CURP</span><span>{d.curp}</span></div>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">Beca Solicitada</h2>
        <div class="grid-2">
          <div class="field"><span class="field-label">Tipo de solicitud</span><span>{solicitud.tipo}</span></div>
          <div class="field"><span class="field-label">Tipo de beca</span><span>{tiposBeca[p.beca_solicitada?.tipo_beca] || '—'}</span></div>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">Información General</h2>
        <div class="grid-2">
          <div class="field"><span class="field-label">Promedio preparatoria</span><span>{p.informacion_general?.promedio_preparatoria || '—'}</span></div>
          <div class="field"><span class="field-label">% beca anterior</span><span>{p.informacion_general?.porcentaje_beca_anterior || '—'}</span></div>
          <div class="field"><span class="field-label">Promedio cuatrimestre anterior</span><span>{p.informacion_general?.promedio_cuatrimestre_anterior || '—'}</span></div>
          <div class="field"><span class="field-label">Otra beca</span><span>{p.informacion_general?.otra_beca || '—'}</span></div>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">Ingresos y Egresos Mensuales</h2>
        <div class="grid-2">
          <div class="field"><span class="field-label">Monto de ingreso</span><span>${p.ingreso_mensual?.monto_ingreso || '0'}</span></div>
          <div class="field"><span class="field-label">Personas dependientes</span><span>{p.ingreso_mensual?.numero_dependientes || '0'}</span></div>
          <div class="field"><span class="field-label">Gastos alimentación</span><span>${p.egreso_mensual?.gastos_alimentacion || '0'}</span></div>
          <div class="field"><span class="field-label">Gastos educación</span><span>${p.egreso_mensual?.gastos_educacion || '0'}</span></div>
          <div class="field"><span class="field-label">Renta / Hipoteca</span><span>${p.egreso_mensual?.gastos_renta_hipoteca || '0'}</span></div>
          <div class="field"><span class="field-label">Servicios</span><span>${p.egreso_mensual?.gastos_servicios || '0'}</span></div>
          <div class="field"><span class="field-label">Gastos varios</span><span>${p.egreso_mensual?.gastos_varios || '0'}</span></div>
          <div class="field">
            <span class="field-label"><strong>Total egresos</strong></span>
            <span><strong>${p.egreso_mensual?.total_egresos || '0'}</strong></span>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">Documentos Adjuntos</h2>
        <div class="docs-grid">
          {#each Object.entries(nombresDoc) as [key, nombre]}
            {#if solicitud.documentos?.[key] === 'pendiente'}
              <div class="doc-btn doc-pendiente">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-disabled)" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>{nombre}</span>
                <span class="doc-badge-pendiente">Pendiente</span>
              </div>
            {:else}
              <button class="doc-btn" on:click={() => abrirDoc(key)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>{nombre}</span>
                <span class="doc-ver">Ver PDF →</span>
              </button>
            {/if}
          {/each}
        </div>
      </div>

    {/if}
  </div>
</main>

<style>
  .main    { padding-top: 56px; min-height: 100vh; background: var(--bg-page); }
  .content { max-width: 900px; margin: 0 auto; padding: 32px 16px; display: flex; flex-direction: column; gap: 20px; }

  .top-row { display: flex; align-items: center; gap: 16px; }
  .btn-back {
    background: none; border: 1.5px solid var(--border); border-radius: 8px;
    padding: 7px 14px; font-family: var(--font); font-size: 13px; font-weight: 500;
    color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
  }
  .btn-back:hover { border-color: var(--orange); color: var(--orange); }
  .page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); }

  .loading-wrap { display: flex; justify-content: center; padding: 60px 0; }
  .spinner-lg {
    width: 36px; height: 36px;
    border: 3px solid var(--border);
    border-top-color: var(--orange); border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .card {
    background: var(--bg-card); border-radius: var(--radius-card);
    box-shadow: var(--shadow-card); padding: 24px 28px;
    display: flex; flex-direction: column; gap: 16px;
  }

  .estado-row    { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
  .estado-change { display: flex; flex-direction: column; gap: 8px; }
  .estado-actions { display: flex; gap: 10px; align-items: center; }
  .select-estado {
    padding: 9px 14px; border: 1.5px solid var(--border-input); border-radius: var(--radius-input);
    font-family: var(--font); font-size: 14px; color: var(--text-primary);
    background: var(--bg-card); cursor: pointer; outline: none;
  }
  .select-estado:focus { border-color: var(--orange); }
  .msg-exito { font-size: 13px; color: var(--success); font-weight: 500; }

  .section-title {
    font-size: 16px; font-weight: 600; color: var(--text-primary);
    padding-bottom: 12px; border-bottom: 1.5px solid var(--border);
  }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
  .field  { display: flex; flex-direction: column; gap: 3px; }
  .field-label {
    font-size: 11px; color: var(--text-secondary); font-weight: 500;
    text-transform: uppercase; letter-spacing: 0.04em;
  }

  .docs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .doc-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 16px; border: 1.5px solid var(--border); border-radius: var(--radius-input);
    background: var(--bg-page); cursor: pointer; font-family: var(--font); font-size: 14px; font-weight: 500; color: var(--text-primary);
    transition: all 0.15s; text-align: left;
  }
  .doc-btn:hover      { border-color: var(--orange); color: var(--orange); }
  .doc-ver            { margin-left: auto; font-size: 12px; color: var(--orange); }
  .doc-pendiente      { cursor: default; opacity: 0.7; border-style: dashed; }
  .doc-badge-pendiente {
    margin-left: auto; font-size: 11px; font-weight: 600;
    color: #92400E; background: #FEF3C7; padding: 2px 8px; border-radius: 20px;
  }

  @media (max-width: 640px) {
    .card       { padding: 16px; }
    .grid-2     { grid-template-columns: 1fr; }
    .docs-grid  { grid-template-columns: 1fr; }
    .estado-row { flex-direction: column; }
  }
</style>