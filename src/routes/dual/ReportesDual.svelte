<script>
  // src/routes/dual/ReportesDual.svelte
  // Importaciones desglosadas
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { 
    isAuthenticated, 
    isAlumnoDual 
  } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/layout/Navbar.svelte'
  import PerfilModal from '../../lib/components/layout/PerfilModal.svelte'
  import { 
    formatFecha, 
    estadoBadgeClass 
  } from '../../lib/utils.js'

  // Variables de estado
  let alumno = null
  let showPerfil = false
  let reportes = []
  let loading = true
  let enviando = false
  let error = ''
  let exito = ''

  // Datos del formulario
  let semana = ''
  let calificacion = ''
  let archivo = null
  let errorForm = ''

  // Catálogo de periodos de entrega
  const SEMANAS = Array.from({ length: 14 }, (_, i) => i + 1)

  // Arreglo de plantillas desglosado verticalmente
  const PLANTILLAS = [
    { 
      label: 'Plantilla Word',  
      ext: 'DOCX', 
      icon: '📄', 
      color: '#2B579A', 
      url: '/plantillas/plantilla_word.docx', 
      filename: 'Plantilla_Semanal_Dual.docx' 
    },
    { 
      label: 'Plantilla Excel', 
      ext: 'XLSX', 
      icon: '📊', 
      color: '#217346', 
      url: '/plantillas/plantilla_excel.xlsx', 
      filename: 'Plantilla_Asistencia_Dual.xlsx' 
    },
    { 
      label: 'Plantilla PDF',   
      ext: 'PDF',  
      icon: '📋', 
      color: '#DC2626', 
      url: '/plantillas/plantilla_pdf.pdf',  
      filename: 'Guia_Reporte_Dual.pdf' 
    }
  ]

  // Validación de permisos de alumno dual
  onMount(async () => {
    if (!get(isAuthenticated)) { 
      navigate('/login', { 
        replace: true 
      })
      return 
    }
    if (!get(isAlumnoDual)) { 
      navigate('/dashboard', { 
        replace: true 
      })
      return 
    }
    try {
      const [alum, reps] = await Promise.all([
        api.alumno.me(),
        api.dual.misReportes()
      ])
      alumno = alum
      reportes = reps
    } catch {
      error = 'No se pudieron cargar los datos.'
    } finally {
      loading = false
    }
  })

  // Control y filtrado del archivo de entrada
  function onArchivo(e) {
    const file = e.target.files[0]
    if (!file) {
      return
    }
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
    if (!semana) { 
      errorForm = 'Selecciona la semana.'
      return 
    }
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
      fd.append('archivo', archivo)
      
      await api.dual.subirReporte(fd)
      
      exito = `Reporte de la Semana {semana} enviado correctamente.`
      reportes = await api.dual.misReportes()
      
      // Limpieza de campos estructurada
      semana = ''
      calificacion = ''
      archivo = null
    } catch (e) {
      errorForm = e.message || 'Error al enviar el reporte.'
    } finally {
      enviando = false
    }
  }
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
                <span class="plantilla-icon" style="color: {p.color}">{p.icon}</span>
                <div>
                  <div class="plantilla-label">{p.label}</div>
                  <div class="plantilla-ext">{p.ext}</div>
                </div>
              </a>
            {:else}
              <button 
                class="plantilla-btn plantilla-disabled" 
                style="--color: {p.color}" 
                disabled 
                title="Próximamente"
              >
                <span class="plantilla-icon">🔒</span>
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
        <h2 class="card-title">Entregar Reporte Semanal</h2>

        {#if exito}
          <div class="success-msg">{exito}</div>
        {/if}
        {#if errorForm}
          <div class="error-msg">{errorForm}</div>
        {/if}

        <div class="form-grid">
          <div class="field">
            <label for="semana">Semana de entrega <span class="req">*</span></label>
            <select id="semana" class="input-plain" bind:value={semana}>
              <option value="">Selecciona la semana correspondiente</option>
              {#each SEMANAS as s}
                <option value={s}>Semana {s}</option>
              {/each}
            </select>
          </div>

          <div class="field">
            <label for="calificacion">Calificación asignada por la empresa <span class="req">*</span></label>
            <input
              id="calificacion"
              class="input-plain"
              type="number"
              min="1"
              max="10"
              step="0.1"
              placeholder="Ej. 9.5"
              bind:value={calificacion}
            />
          </div>

          <div class="field field-full">
            <label for="archivo-input">Reporte firmado digitalmente (PDF) <span class="req">*</span></label>
            {#if archivo}
              <div class="doc-selected">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2.2">
                  <path 
                    d="M14 2
                       H6
                       a2 2 0 0 0-2 2
                       v16
                       a2 2 0 0 0 2 2
                       h12
                       a2 2 0 0 0 2-2
                       V8z"
                  />
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span class="doc-name">{archivo.name}</span>
                <button class="doc-remove" on:click={() => archivo = null}>✕</button>
              </div>
            {:else}
              <label class="doc-upload" for="archivo-input">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="16 16 12 12 8 16"/>
                  <line x1="12" y1="12" x2="12" y2="21"/>
                  <path 
                    d="M20.39 18.39
                       A5 5 0 0 0 18 9
                       h-1.26
                       A8 8 0 1 0 3 16.3"
                  />
                </svg>
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
            class="btn-primary" 
            style="max-width: 200px" 
            on:click={enviarReporte} 
            disabled={enviando}
          >
            {enviando ? 'Subiendo...' : 'Enviar Reporte'}
          </button>
        </div>
      </div>

      <div class="card">
        <h2 class="card-title">Historial de Reportes Entregados</h2>

        {#if reportes.length === 0}
          <p class="empty-msg">Aún no has enviado ningún reporte semanal a este módulo.</p>
        {:else}
          <div class="tabla-wrap">
            <table class="tabla">
              <thead>
                <tr>
                  <th>Semana</th>
                  <th class="td-center">Calificación</th>
                  <th>Estatus</th>
                  <th>Observaciones del Coordinador</th>
                  <th>Fecha de Envío</th>
                </tr>
              </thead>
              <tbody>
                {#each reportes as r}
                  <tr>
                    <td>
                      <span style="font-weight:600; color:var(--text-primary);">
                        Semana {r.semana}
                      </span>
                    </td>
                    <td class="td-cal">{r.calificacion_alumno}</td>
                    <td>
                      <span class={estadoBadgeClass(r.estado)}>
                        {r.estado}
                      </span>
                    </td>
                    <td class="td-nota">{r.nota_agente || '—'}</td>
                    <td class="td-fecha">{formatFecha(r.created_at)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
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

  .plantilla-icon { 
    font-size: 22px; 
    flex-shrink: 0; 
  }

  .plantilla-label { 
    font-size: 13px; 
    font-weight: 700; 
    color: var(--text-primary); 
  }

  .plantilla-ext { 
    font-size: 11px; 
    color: var(--color); 
    font-weight: 700; 
    text-transform: uppercase; 
    margin-top: 1px; 
  }

  .plantilla-pronto { 
    color: var(--text-disabled) !important; 
    font-weight: 500; 
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
    justify-content: flex-end; 
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
    background: var(--bg-page); 
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
    font-size: 14px; 
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
  }

  .tabla-wrap { 
    overflow-x: auto; 
    border: 1px solid var(--border); 
    border-radius: var(--radius-card); 
    background: var(--bg-card); 
  }

  .tabla { 
    width: 100%; 
    border-collapse: collapse; 
    font-size: 14px; 
  }

  .tabla th { 
    text-align: left; 
    padding: 12px 16px; 
    font-size: 11px; 
    font-weight: 600; 
    color: var(--text-disabled); 
    border-bottom: 1px solid var(--border); 
    text-transform: uppercase; 
    letter-spacing: 0.05em; 
    background: var(--bg-page); 
    white-space: nowrap; 
  }

  .tabla td { 
    padding: 14px 16px; 
    border-bottom: 1px solid var(--border); 
    color: var(--text-secondary); 
    vertical-align: middle; 
  }

  .tabla tr:last-child td { 
    border-bottom: none; 
  }

  .tabla tr:hover td { 
    background: var(--orange-light); 
  }
  
  .td-cal { 
    font-weight: 700; 
    color: var(--orange); 
    text-align: center; 
    font-size: 15px; 
  }

  .td-nota { 
    font-size: 13px; 
    color: var(--text-secondary); 
    word-break: break-word; 
  }

  .td-fecha { 
    font-size: 13px; 
    color: var(--text-disabled); 
    white-space: nowrap; 
  }

  .success-msg { 
    background: rgba(34, 197, 94, 0.08); 
    border: 1px solid rgba(34, 197, 94, 0.2); 
    color: var(--success); 
    border-radius: 8px; 
    padding: 12px 14px; 
    font-size: 13px; 
    font-weight: 500; 
    text-align: center; 
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