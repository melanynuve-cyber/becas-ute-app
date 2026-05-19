<script>
  // src/routes/dual/ReportesDual.svelte
  // Importaciones desglosadas
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated, isAlumnoDual } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'
  import PerfilModal from '../../lib/components/layout/PerfilModal.svelte'
  import { formatFecha, estadoBadgeClass } from '../../lib/utils.js'

  // Variables de estado
  let alumno = null
  let showPerfil = false
  let reportes = []
  let loading = true
  let enviando = false
  let error = ''

  // Variables de control de Flujo Progresivo
  let infoSemana = null

  // Modo debug: omite la restricción de día viernes
  let debugMode = false

  // Control de expansión del formulario inline
  let formAbierto = false

  // Datos del formulario
  let semana = ''
  let calificacion = ''
  let fechaInicio = ''
  let fechaFin = ''
  let archivo = null
  let errorForm = ''

  const PLANTILLAS = [
    { 
      label: 'Plantilla Word',  
      ext: 'DOCX', 
      color: '#2B579A', 
      url: '/plantillas/plantilla_word.docx', 
      filename: 'Plantilla_Semanal_Dual.docx' 
    },
    { 
      label: 'Plantilla Excel', 
      ext: 'XLSX', 
      color: '#217346', 
      url: '/plantillas/plantilla_excel.xlsx', 
      filename: 'Plantilla_Asistencia_Dual.xlsx' 
    },
    { 
      label: 'Plantilla PDF',   
      ext: 'PDF',  
      color: '#DC2626', 
      url: '/plantillas/plantilla_pdf.pdf',  
      filename: 'Guia_Reporte_Dual.pdf' 
    }
  ]

  // Validación de permisos de alumno dual
  onMount(async () => {
    if (!get(isAuthenticated)) { 
      navigate('/login', { replace: true }); return 
    }
    if (!get(isAlumnoDual)) { 
      navigate('/dashboard', { replace: true }); return 
    }
    await cargarDatos()
  })

  async function cargarDatos() {
    loading = true
    try {
      const [alum, reps, info] = await Promise.all([
        api.alumno.me(),
        api.dual.misReportes(),
        api.dual.semanaActual()
      ])
      alumno = alum
      reportes = reps
      infoSemana = info
      semana = info.semana_disponible
    } catch {
      error = 'No se pudieron cargar los datos.'
    } finally {
      loading = false
    }
  }

  // Apertura y cierre del formulario inline de la semana disponible
  function toggleForm() {
    formAbierto = !formAbierto
    errorForm = ''
  }

  // Control y filtrado del archivo de entrada
  function onArchivo(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      errorForm = 'Solo se aceptan archivos PDF.'
      archivo = null
      return
    }
    errorForm = ''
    archivo = file
  }

  // Procesamiento y envío de la entrega semanal
  async function enviarReporte() {
    errorForm = ''
    if (!calificacion) { 
      errorForm = 'Ingresa la calificación.'
      return 
    }
    if (!archivo) { 
      errorForm = 'Adjunta el PDF del reporte.'
      return 
    }

    enviando = true
    try {
      const fd = new FormData()
      fd.append('semana', semana)
      fd.append('calificacion_alumno', calificacion)
      fd.append('fecha_inicio', fechaInicio)
      fd.append('fecha_fin', fechaFin)
      fd.append('archivo', archivo)
      
      await api.dual.subirReporte(fd)

      formAbierto = false
      calificacion = ''
      fechaInicio = ''
      fechaFin = ''
      archivo = null

      await cargarDatos() // Recalcula la siguiente semana automaticamente
    } catch (e) {
      errorForm = e.message || 'Error al enviar el reporte.'
    } finally {
      enviando = false
    }
  }

  // Nombre de la empresa del alumno para mostrarlo en las tarjetas
  $: empresaNombre = alumno?.empresa || ''

  // Indica si la semana disponible corresponde a un reporte rechazado
  $: semanaRechazada = infoSemana?.estado_actual === 'Rechazada'
</script>

<Navbar onAlumnoClick={() => showPerfil = true} />
<PerfilModal bind:show={showPerfil} {alumno} />

<div style="padding-top: 56px;">
  <div class="page">

    {#if loading}
      <div class="loading-wrap">
        <div class="spinner-lg"></div>
      </div>
    {:else}

      <h1 class="page-title">Reportes Dual</h1>

      <div class="card">
        <h2 class="card-title">Plantillas Oficiales de Reporte</h2>
        <div class="plantillas-grid">
          {#each PLANTILLAS as p}
            {#if p.url}
              <a 
                href={p.url} 
                download={p.filename} 
                class="plantilla-btn" 
                style="--color: {p.color}"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="color:{p.color}; flex-shrink:0;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <div>
                  <div class="plantilla-label">{p.label}</div>
                  <div class="plantilla-ext" style="color:{p.color}">{p.ext}</div>
                </div>
              </a>
            {:else}
              <button 
                class="plantilla-btn plantilla-disabled" 
                style="--color: {p.color}" 
                disabled 
                title="Próximamente"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="color:var(--text-disabled); flex-shrink:0;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <div>
                  <div class="plantilla-label">{p.label}</div>
                  <div class="plantilla-ext plantilla-pronto">Próximamente</div>
                </div>
              </button>
            {/if}
          {/each}
        </div>
      </div>

      <div class="card">
        <h2 class="card-title">En Proceso</h2>

        <div class="tarjetas-lista">

          {#each reportes.filter(r => r.estado !== "Rechazada") as r}
            <div class="tarjeta">
              <div class="tarjeta-icono icono-activo">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 016 4.5h4.5m9.75 9.75v-4.5m0 4.5h-4.5m4.5 0l-9-9M15 3h6m0 0v6m0-6L9.75 14.25" />
                </svg>
              </div>
              <div class="tarjeta-info">
                <div class="tarjeta-titulo">Reporte dual — Semana {r.semana}</div>
                <div class="tarjeta-sub">
                  Enviado el {formatFecha(r.created_at)}{empresaNombre ? ` · ${empresaNombre}` : ''}
                </div>
              </div>
              <span class={estadoBadgeClass(r.estado)}>{r.estado}</span>
            </div>
          {/each}

          {#if infoSemana && !infoSemana.bloqueado}
            <div
              class="tarjeta tarjeta-disponible"
              class:abierta={formAbierto}
              class:tarjeta-rechazada={semanaRechazada}
              on:click={toggleForm}
              role="button"
              tabindex="0"
              on:keydown={(e) => e.key === 'Enter' && toggleForm()}
            >
              <div class="tarjeta-icono" class:icono-inactivo={!semanaRechazada} class:icono-rechazado={semanaRechazada}>
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 016 4.5h4.5m9.75 9.75v-4.5m0 4.5h-4.5m4.5 0l-9-9M15 3h6m0 0v6m0-6L9.75 14.25" />
                </svg>
              </div>
              <div class="tarjeta-info">
                <div class="tarjeta-titulo" class:tarjeta-titulo-inactivo={!semanaRechazada} class:tarjeta-titulo-rechazado={semanaRechazada}>
                  Reporte dual — Semana {infoSemana.semana_disponible}
                </div>
                {#if semanaRechazada}
                  <div class="tarjeta-sub">Rechazado — favor de volver a enviar</div>
                {:else}
                  <div class="tarjeta-sub">Aún no enviado</div>
                {/if}
              </div>
              {#if semanaRechazada}
                <span class="badge-rechazado">Rechazada</span>
              {:else}
                <span class="badge-sin-enviar">Sin enviar</span>
              {/if}
            </div>

            {#if formAbierto}
              <div class="form-inline" on:click|stopPropagation>

                {#if semanaRechazada && infoSemana.nota_agente}
                  <div class="nota-rechazo">
                    <div class="nota-rechazo-label">Observaciones del coordinador</div>
                    <div class="nota-rechazo-texto">{infoSemana.nota_agente}</div>
                  </div>
                {/if}

                {#if errorForm}
                  <div class="error-msg">{errorForm}</div>
                {/if}

                <div class="form-grid">
                  <div class="field">
                    <label>Semana asignada (Automático)</label>
                    <input 
                      type="text" 
                      class="input-plain" 
                      value="Semana {infoSemana.semana_disponible}" 
                      disabled 
                      style="font-weight: 600; color: var(--text-primary); background: var(--bg-page);"
                    />
                  </div>

                  <div class="field">
                    <label for="calificacion">Calificación de la empresa <span class="req">*</span></label>
                    <input
                      id="calificacion"
                      class="input-plain"
                      type="number"
                      min="1" max="10" step="0.1"
                      placeholder="Ej. 9.5"
                      bind:value={calificacion}
                    />
                  </div>

                  <div class="field">
                    <label>Periodo (Fecha de inicio) <span class="req">*</span></label>
                    <input 
                      type="date" 
                      class="input-plain" 
                      bind:value={fechaInicio} 
                    />
                  </div>

                  <div class="field">
                    <label>Periodo (Fecha de fin) <span class="req">*</span></label>
                    <input 
                      type="date" 
                      class="input-plain" 
                      bind:value={fechaFin} 
                    />
                  </div>

                  <div class="field field-full">
                    <label for="archivo-input">Reporte firmado digitalmente (PDF) <span class="req">*</span></label>
                    {#if archivo}
                      <div class="doc-selected">
                        <span class="doc-name">{archivo.name}</span>
                        <button class="doc-remove" on:click={() => archivo = null}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    {:else}
                      <label class="doc-upload" for="archivo-input">
                        Seleccionar archivo del reporte en formato PDF
                        <input 
                          id="archivo-input" 
                          type="file" 
                          accept=".pdf" 
                          style="display:none" 
                          on:change={onArchivo}
                        />
                      </label>
                    {/if}
                  </div>
                </div>

                <div class="form-actions">
                  <button
                    class="btn-debug"
                    on:click={() => debugMode = !debugMode}
                    title="Omite la restricción de día viernes"
                  >
                    {debugMode ? 'Debug ON' : 'Debug OFF'}
                  </button>
                  <button class="btn-outline" on:click={toggleForm}>
                    Cancelar
                  </button>
                  <button 
                    class="btn-primary" 
                    on:click={enviarReporte} 
                    disabled={enviando}
                  >
                    {enviando ? 'Subiendo...' : 'Enviar Reporte'}
                  </button>
                </div>
              </div>
            {/if}
          {/if}

          {#if reportes.length === 0 && !infoSemana}
            <div class="tarjeta">
              <p class="empty-msg">Aún no hay reportes registrados en este cuatrimestre.</p>
            </div>
          {/if}

        </div>
      </div>

    {/if}
  </div>
</div>

<style>
  .page { 
    max-width: 900px; 
    margin: 0 auto; 
    padding: 40px 24px 64px; 
    display: flex; 
    flex-direction: column; 
    gap: 24px; 
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
    padding: 60px; 
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
    gap: 20px; 
  }

  .card-title { 
    font-size: 15px; 
    font-weight: 700; 
    color: var(--text-primary); 
  }

  .plantillas-grid { 
    display: grid; 
    grid-template-columns: repeat(3, 1fr); 
    gap: 12px; 
  }

  .plantilla-btn { 
    display: flex; 
    align-items: center; 
    gap: 14px; 
    padding: 14px 16px; 
    border: 1px solid var(--border); 
    border-radius: var(--radius-card); 
    background: var(--bg-page); 
    cursor: pointer; 
    text-decoration: none; 
    transition: all 0.2s ease; 
  }

  .plantilla-btn:hover { 
    border-color: var(--color); 
    background: var(--bg-card); 
    box-shadow: var(--shadow-card); 
  }

  .plantilla-disabled { 
    cursor: not-allowed; 
    opacity: 0.5; 
  }

  .plantilla-disabled:hover { 
    border-color: var(--border); 
    background: var(--bg-page); 
    box-shadow: none; 
  }

  .plantilla-label { 
    font-size: 13px; 
    font-weight: 700; 
    color: var(--text-primary); 
  }

  .plantilla-ext { 
    font-size: 11px; 
    font-weight: 700; 
    text-transform: uppercase; 
    margin-top: 1px; 
  }

  .plantilla-pronto { 
    color: var(--text-disabled) !important; 
    font-weight: 500; 
  }

  .tarjetas-lista {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    overflow: hidden;
  }

  .tarjeta {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border);
  }

  .tarjeta:last-child {
    border-bottom: none;
  }

  .tarjeta-disponible {
    cursor: pointer;
    transition: background 0.15s;
  }

  .tarjeta-disponible:hover {
    background: var(--bg-page);
  }

  .tarjeta-disponible.abierta {
    background: var(--bg-page);
  }

  .tarjeta-icono {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .icono-activo {
    background: rgba(249, 115, 22, 0.1);
    color: var(--orange);
  }

  .icono-inactivo {
    background: var(--bg-page);
    border: 1px solid var(--border);
    color: var(--text-disabled);
  }

  .tarjeta-info {
    flex: 1;
    min-width: 0;
  }

  .tarjeta-titulo {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .tarjeta-titulo-inactivo {
    color: var(--text-secondary);
    font-weight: 600;
  }

  .tarjeta-sub {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .badge-sin-enviar {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-disabled);
    white-space: nowrap;
  }

  .form-inline {
    padding: 20px;
    background: var(--bg-page);
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-grid { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 16px; 
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

  .field-full { 
    grid-column: 1 / -1; 
  }

  .req { 
    color: var(--orange); 
  }

  .form-actions { 
    display: flex; 
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
  }

  .btn-debug {
    background: none;
    border: 1.5px dashed var(--border);
    border-radius: 8px;
    padding: 7px 14px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-disabled);
    cursor: pointer;
    font-family: var(--font);
    transition: all 0.15s ease;
    margin-right: auto;
  }

  .btn-debug:hover {
    border-color: var(--text-disabled);
    color: var(--text-secondary);
  }

  .doc-upload { 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    gap: 10px; 
    padding: 16px; 
    border: 2px dashed var(--border-input); 
    border-radius: var(--radius-input); 
    cursor: pointer; 
    font-size: 13px; 
    font-weight: 500; 
    color: var(--text-secondary); 
    background: var(--bg-card); 
    transition: all 0.15s ease; 
  }

  .doc-upload:hover { 
    border-color: var(--orange); 
    color: var(--orange); 
    background: var(--orange-light); 
  }
  
  .doc-selected { 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    padding: 14px 16px; 
    border: 1px solid rgba(249, 115, 22, 0.2); 
    border-radius: var(--radius-input); 
    background: var(--orange-light); 
  }

  .doc-name { 
    flex: 1; 
    font-size: 13px; 
    font-weight: 600; 
    color: var(--text-primary); 
    overflow: hidden; 
    text-overflow: ellipsis; 
    white-space: nowrap; 
  }

  .doc-remove { 
    background: none; 
    border: none; 
    cursor: pointer; 
    color: var(--text-disabled); 
    display: flex;
    align-items: center;
    transition: color 0.15s; 
  }

  .doc-remove:hover { 
    color: var(--error); 
  }

  .empty-msg { 
    font-size: 13px; 
    color: var(--text-disabled); 
    font-style: italic; 
    text-align: center; 
    padding: 12px 0;
    flex: 1;
  }

  .tarjeta-rechazada {
    border-left: 3px solid var(--error);
  }

  .icono-rechazado {
    background: rgba(239, 68, 68, 0.08);
    color: var(--error);
  }

  .tarjeta-titulo-rechazado {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .badge-rechazado {
    font-size: 12px;
    font-weight: 600;
    color: var(--error);
    white-space: nowrap;
  }

  .nota-rechazo {
    padding: 14px 16px;
    background: rgba(239, 68, 68, 0.04);
    border: 1px solid rgba(239, 68, 68, 0.15);
    border-radius: var(--radius-input);
  }

  .nota-rechazo-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--error);
    margin-bottom: 6px;
  }

  .nota-rechazo-texto {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    .card { 
      padding: 24px 20px; 
    }
    .plantillas-grid { 
      grid-template-columns: 1fr; 
    }
    .form-grid { 
      grid-template-columns: 1fr; 
    }
  }
</style>