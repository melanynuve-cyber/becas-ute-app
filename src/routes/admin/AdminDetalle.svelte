<script>
  // src/routes/admin/AdminDetalle.svelte
  // Importaciones desglosadas
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { 
    isAuthenticated, 
    isAdmin, 
    token 
  } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'
  import { 
    estadoBadgeClass, 
    estadoLabel 
  } from '../../lib/utils.js'

  // Propiedades del enrutador
  export let id

  // Variables de control de estado y carga
  let solicitud = null
  let loading = true
  let guardando = false
  let error = ''
  let exito = ''
  let nuevoEstado = ''

  // Catálogo de opciones de flujo desglosado verticalmente
  const estadoOpciones = [
    'Pendiente', 
    'En_revision', 
    'Aprobada', 
    'Rechazada'
  ]

  // Mapeo de tipos de becas institucionales
  const tiposBeca = {
    academica: 'A. Académica',
    deportiva: 'B. Deportiva',
    cultural: 'C. Cultural',
    alimentos: 'D. Alimentos',
    transporte: 'E. Transporte',
    empleado_hijo: 'F. Empleado y/o hijo de empleado'
  }

  // Mapeo de identificadores de archivos de expediente
  const nombresDoc = {
    kardex: 'Kárdex',
    recibo_ingresos: 'Recibo de Ingresos',
    recibo_servicio_publico: 'Recibo de Servicio Público',
    recibo_inscripcion: 'Comprobante de Inscripción'
  }

  // Validación de seguridad y rol de administrador
  onMount(async () => {
    if (!get(isAuthenticated) || !get(isAdmin)) {
      navigate('/login', { 
        replace: true 
      })
      return
    }
    try {
      solicitud = await api.admin.detalle(id)
      nuevoEstado = solicitud.estado
    } catch {
      error = 'No se pudo cargar la solicitud'
    } finally {
      loading = false
    }
  })

  // Persistencia del cambio de estado del trámite
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

  // Descarga y manejo seguro de streams de archivos PDF binarios
  async function abrirDoc(tipo) {
    error = ''
    try {
      const jwt = get(token)
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const endpoint = `${BASE_URL}/admin/solicitudes/${id}/documento/${tipo}`
      
      const res = await fetch(endpoint, {
        headers: { 
          Authorization: `Bearer ${jwt}` 
        }
      })
      
      if (!res.ok) {
        throw new Error('No se pudo cargar el documento')
      }
      
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
    } catch (e) {
      error = e.message
    }
  }

  // Evaluación reactiva de los payloads internos
  $: p = solicitud?.payload || {}
  $: d = p.datos_personales || {}
</script>

<Navbar />

<main class="main">
  <div class="content">

    <div class="top-row">
      <button class="btn-back" on:click={() => navigate('/admin/solicitudes')}>
        ← Volver a la lista
      </button>
      <h1 class="page-title">Detalle de Solicitud</h1>
    </div>

    {#if loading}
      <div class="loading-wrap">
        <div class="spinner-lg"></div>
      </div>
    {:else if solicitud}

      <div class="card estado-card">
        <div class="estado-row">
          <div>
            <p class="field-label">Estado actual del folio</p>
            <span class={estadoBadgeClass(solicitud.estado)}>
              {estadoLabel(solicitud.estado)}
            </span>
          </div>
          <div class="estado-change">
            <p class="field-label">Dictaminar expediente</p>
            <div class="estado-actions">
              <select class="select-estado" bind:value={nuevoEstado}>
                {#each estadoOpciones as op}
                  <option value={op}>{estadoLabel(op)}</option>
                {/each}
              </select>
              <button
                class="btn-primary btn-save-estado"
                on:click={guardarEstado}
                disabled={guardando || nuevoEstado === solicitud.estado}
              >
                {guardando ? 'Guardando...' : 'Aplicar'}
              </button>
            </div>
          </div>
        </div>
        {#if exito}
          <p class="msg-exito">{exito}</p>
        {/if}
        {#if error}
          <div class="error-msg">{error}</div>
        {/if}
      </div>

      <div class="card">
        <h2 class="section-title">Datos Personales</h2>
        <div class="grid-2">
          <div class="field">
            <span class="field-label">Matrícula</span>
            <span class="field-value font-mono">{solicitud.matricula}</span>
          </div>
          <div class="field">
            <span class="field-label">Nombre(s)</span>
            <span class="field-value">{d.nombres}</span>
          </div>
          <div class="field">
            <span class="field-label">Apellido Paterno</span>
            <span class="field-value">{d.apellido_paterno}</span>
          </div>
          <div class="field">
            <span class="field-label">Apellido Materno</span>
            <span class="field-value">{d.apellido_materno}</span>
          </div>
          <div class="field">
            <span class="field-label">Programa educativo</span>
            <span class="field-value">{d.programa_educativo}</span>
          </div>
          <div class="field">
            <span class="field-label">Cuatrimestre a cursar</span>
            <span class="field-value">{d.cuatrimestre_a_cursar}° Cuatrimestre</span>
          </div>
          <div class="field">
            <span class="field-label">Turno</span>
            <span class="field-value">
              {d.turno === 'M' ? 'Matutino' : 'Vespertino'}
            </span>
          </div>
          <div class="field">
            <span class="field-label">Grupo</span>
            <span class="field-value font-mono">{d.grupo}</span>
          </div>
          <div class="field">
            <span class="field-label">Domicilio</span>
            <span class="field-value">
              {d.domicilio_calle} {d.domicilio_numero}, {d.colonia}, {d.municipio}
            </span>
          </div>
          <div class="field">
            <span class="field-label">Correo electrónico</span>
            <span class="field-value">{d.correo_electronico}</span>
          </div>
          <div class="field">
            <span class="field-label">Estado civil</span>
            <span class="field-value">{d.estado_civil}</span>
          </div>
          <div class="field">
            <span class="field-label">Edad</span>
            <span class="field-value">{d.edad} años</span>
          </div>
          <div class="field">
            <span class="field-label">Celular</span>
            <span class="field-value">{d.celular}</span>
          </div>
          <div class="field">
            <span class="field-label">RFC</span>
            <span class="field-value font-mono">{d.rfc}</span>
          </div>
          <div class="field">
            <span class="field-label">CURP</span>
            <span class="field-value font-mono">{d.curp}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">Beca Solicitada</h2>
        <div class="grid-2">
          <div class="field">
            <span class="field-label">Tipo de solicitud</span>
            <span class="field-value">{solicitud.tipo}</span>
          </div>
          <div class="field">
            <span class="field-label">Tipo de beca especificado</span>
            <span class="field-value">
              {tiposBeca[p.beca_solicitada?.tipo_beca] || '—'}
            </span>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">Información General Académica</h2>
        <div class="grid-2">
          <div class="field">
            <span class="field-label">Promedio preparatoria</span>
            <span class="field-value">{p.informacion_general?.promedio_preparatoria || '—'}</span>
          </div>
          <div class="field">
            <span class="field-label">% beca anterior</span>
            <span class="field-value">{p.informacion_general?.porcentaje_beca_anterior || '—'}</span>
          </div>
          <div class="field">
            <span class="field-label">Promedio cuatrimestre anterior</span>
            <span class="field-value">{p.informacion_general?.promedio_cuatrimestre_anterior || '—'}</span>
          </div>
          <div class="field">
            <span class="field-label">Posee otra beca externa</span>
            <span class="field-value">{p.informacion_general?.otra_beca || '—'}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">Estudio de Ingresos y Egresos Mensuales</h2>
        <div class="grid-2">
          <div class="field">
            <span class="field-label">Monto de ingreso mensual</span>
            <span class="field-value">${p.ingreso_mensual?.monto_ingreso || '0'}</span>
          </div>
          <div class="field">
            <span class="field-label">Personas dependientes del ingreso</span>
            <span class="field-value">{p.ingreso_mensual?.numero_dependientes || '0'}</span>
          </div>
          <div class="field">
            <span class="field-label">Gastos alimentación</span>
            <span class="field-value">${p.egreso_mensual?.gastos_alimentacion || '0'}</span>
          </div>
          <div class="field">
            <span class="field-label">Gastos educación</span>
            <span class="field-value">${p.egreso_mensual?.gastos_educacion || '0'}</span>
          </div>
          <div class="field">
            <span class="field-label">Renta / Hipoteca</span>
            <span class="field-value">${p.egreso_mensual?.gastos_renta_hipoteca || '0'}</span>
          </div>
          <div class="field">
            <span class="field-label">Servicios básicos</span>
            <span class="field-value">${p.egreso_mensual?.gastos_servicios || '0'}</span>
          </div>
          <div class="field">
            <span class="field-label">Gastos varios adicionales</span>
            <span class="field-value">${p.egreso_mensual?.gastos_varios || '0'}</span>
          </div>
          <div class="field">
            <span class="field-label" style="font-weight: 700; color: var(--text-primary);">Total egresos</span>
            <span class="field-value" style="color: var(--text-primary); font-weight: 700;">
              ${p.egreso_mensual?.total_egresos || '0'}
            </span>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">Documentos Adjuntos Obligatorios</h2>
        <div class="docs-grid">
          {#each Object.entries(nombresDoc) as [key, nombre]}
            {#if solicitud.documentos?.[key] === 'pendiente'}
              <div class="doc-btn doc-pendiente">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-disabled)" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>{nombre}</span>
                <span class="doc-badge-pendiente">Pendiente alumno</span>
              </div>
            {:else}
              <button class="doc-btn" on:click={() => abrirDoc(key)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>{nombre}</span>
                <span class="doc-ver">Ver PDF ↗</span>
              </button>
            {/if}
          {/each}
        </div>
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
    padding: 40px 24px; 
    display: flex; 
    flex-direction: column;
    gap: 24px; 
  }

  .top-row { 
    display: flex; 
    align-items: center; 
    gap: 16px;
  }

  .btn-back {
    background: none; 
    border: 1.5px solid var(--border); 
    border-radius: 8px;
    padding: 7px 16px; 
    font-family: var(--font);
    font-size: 13px; 
    font-weight: 600;
    color: var(--text-secondary); 
    cursor: pointer; 
    transition: all 0.15s ease;
  }

  .btn-back:hover { 
    border-color: var(--orange); 
    color: var(--orange);
  }

  .page-title { 
    font-size: 22px; 
    font-weight: 700; 
    color: var(--text-primary); 
    letter-spacing: -0.02em;
  }

  .loading-wrap { 
    display: flex; 
    justify-content: center;
    padding: 60px 0; 
  }

  .spinner-lg {
    width: 32px; 
    height: 32px;
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

  .card {
    background: var(--bg-card); 
    border-radius: var(--radius-card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-card); 
    padding: 28px;
    display: flex;
    flex-direction: column; 
    gap: 16px;
  }

  .estado-card {
    border-left: 4px solid var(--orange);
  }

  .estado-row { 
    display: flex; 
    align-items: flex-start; 
    justify-content: space-between; 
    gap: 24px;
    flex-wrap: wrap; 
  }

  .estado-change { 
    display: flex; 
    flex-direction: column; 
    gap: 8px; 
  }

  .estado-actions { 
    display: flex; 
    gap: 10px;
    align-items: center; 
  }

  .select-estado {
    padding: 9px 14px; 
    border: 1.5px solid var(--border-input); 
    border-radius: var(--radius-input);
    font-family: var(--font);
    font-size: 14px; 
    color: var(--text-primary);
    background: var(--bg-card); 
    cursor: pointer; 
    outline: none;
    transition: border-color 0.15s ease;
  }

  .select-estado:focus { 
    border-color: var(--orange);
  }

  .btn-save-estado {
    width: auto;
    padding: 10px 20px;
  }

  .msg-exito { 
    font-size: 13px; 
    color: var(--success); 
    font-weight: 600; 
  }

  .section-title {
    font-size: 14px;
    font-weight: 700; 
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding-bottom: 12px; 
    border-bottom: 1px solid var(--border);
  }

  .grid-2 { 
    display: grid; 
    grid-template-columns: 1fr 1fr;
    gap: 16px 32px; 
  }

  .field { 
    display: flex; 
    flex-direction: column; 
    gap: 4px;
  }

  .field-label {
    font-size: 11px; 
    color: var(--text-disabled); 
    font-weight: 600;
    text-transform: uppercase; 
    letter-spacing: 0.04em;
  }

  .field-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .font-mono {
    font-family: monospace;
    letter-spacing: 0.02em;
    font-weight: 600;
    color: var(--text-primary);
  }

  .docs-grid { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 12px; 
  }

  .doc-btn {
    display: flex;
    align-items: center; 
    gap: 10px;
    padding: 14px 16px; 
    border: 1px solid var(--border); 
    border-radius: var(--radius-input);
    background: var(--bg-page); 
    cursor: pointer; 
    font-family: var(--font);
    font-size: 13px; 
    font-weight: 600; 
    color: var(--text-primary);
    transition: all 0.15s ease; 
    text-align: left;
  }

  .doc-btn:hover { 
    border-color: var(--orange); 
    color: var(--orange);
    background: var(--bg-card);
  }

  .doc-ver { 
    margin-left: auto; 
    font-size: 12px;
    font-weight: 600;
    color: var(--orange); 
  }

  .doc-pendiente { 
    cursor: not-allowed; 
    opacity: 0.6; 
    border-style: dashed;
  }
  
  .doc-pendiente:hover {
    border-color: var(--border);
    color: var(--text-primary);
    background: var(--bg-page);
  }

  .doc-badge-pendiente {
    margin-left: auto; 
    font-size: 11px; 
    font-weight: 600;
    color: var(--orange); 
    background: var(--orange-light); 
    padding: 2px 8px;
    border-radius: 6px;
    border: 1px solid rgba(249, 115, 22, 0.2);
  }

  @media (max-width: 768px) {
    .card { 
      padding: 20px;
    }
    .grid-2 { 
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .docs-grid { 
      grid-template-columns: 1fr; 
    }
    .estado-row { 
      flex-direction: column; 
      gap: 16px;
    }
  }
</style>