<script>
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-routing'
  import { get } from 'svelte/store'
  import { isAuthenticated, isAlumnoDual } from '../../lib/stores/auth.js'
  import { api } from '../../lib/services/api.js'
  import Navbar from '../../lib/components/Navbar.svelte'
  import PerfilModal from '../../lib/components/PerfilModal.svelte'
  import { formatFecha, estadoBadgeClass } from '../../lib/utils.js'

  let alumno   = null
  let showPerfil = false
  let reportes = []
  let loading  = true
  let enviando = false
  let error    = ''
  let exito    = ''

  // Formulario
  let semana       = ''
  let calificacion = ''
  let archivo      = null
  let errorForm    = ''

  const SEMANAS = Array.from({ length: 14 }, (_, i) => i + 1)

  // TODO: conectar con archivos reales cuando estén disponibles en el servidor
  const PLANTILLAS = [
    { label: 'Plantilla Word',  ext: 'DOCX', icon: '📄', color: '#2B579A', url: null },
    { label: 'Plantilla Excel', ext: 'XLSX', icon: '📊', color: '#217346', url: null },
    { label: 'Plantilla PDF',   ext: 'PDF',  icon: '📋', color: '#DC2626', url: null },
  ]

  onMount(async () => {
    if (!get(isAuthenticated)) { navigate('/login',      { replace: true }); return }
    if (!get(isAlumnoDual))    { navigate('/dashboard',  { replace: true }); return }
    try {
      const [alum, reps] = await Promise.all([
        api.alumno.me(),
        api.dual.misReportes(),
      ])
      alumno   = alum
      reportes = reps
    } catch {
      error = 'No se pudieron cargar los datos.'
    } finally {
      loading = false
    }
  })

  function onArchivo(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      errorForm = 'Solo se aceptan archivos PDF.'
      archivo   = null
      return
    }
    errorForm = ''
    archivo   = file
  }

  async function enviarReporte() {
    errorForm = ''
    if (!semana)       { errorForm = 'Selecciona la semana.';           return }
    if (!calificacion) { errorForm = 'Ingresa la calificación.';        return }
    if (!archivo)      { errorForm = 'Adjunta el PDF del reporte.';     return }

    enviando = true
    try {
      const fd = new FormData()
      fd.append('semana',               semana)
      fd.append('calificacion_alumno',  calificacion)
      fd.append('archivo',              archivo)
      await api.dual.subirReporte(fd)
      exito    = `Reporte de la Semana ${semana} enviado correctamente.`
      reportes = await api.dual.misReportes()
      semana = ''; calificacion = ''; archivo = null
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
      <div class="loading-wrap"><div class="spinner-lg"></div></div>
    {:else}

      <h1 class="page-title">Reportes Dual</h1>

      <!-- Descargas -->
      <div class="card">
        <h2 class="card-title">Plantillas de Reporte</h2>
        <div class="plantillas-grid">
          {#each PLANTILLAS as p}
            {#if p.url}
              <a href={p.url} download class="plantilla-btn" style="--color: {p.color}">
                <span class="plantilla-icon">{p.icon}</span>
                <div>
                  <div class="plantilla-label">{p.label}</div>
                  <div class="plantilla-ext">{p.ext}</div>
                </div>
              </a>
            {:else}
              <button class="plantilla-btn plantilla-disabled" style="--color: {p.color}" disabled title="Próximamente">
                <span class="plantilla-icon">{p.icon}</span>
                <div>
                  <div class="plantilla-label">{p.label}</div>
                  <div class="plantilla-ext plantilla-pronto">Próximamente</div>
                </div>
              </button>
            {/if}
          {/each}
        </div>
      </div>

      <!-- Formulario de entrega -->
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
            <label for="semana">Semana <span class="req">*</span></label>
            <select id="semana" class="input-plain" bind:value={semana}>
              <option value="">Selecciona la semana</option>
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
              type="number" min="1" max="10" step="0.1"
              placeholder="Ej. 9.5"
              bind:value={calificacion}
            />
          </div>

          <div class="field field-full">
            <label for="archivo-input">Reporte firmado (PDF) <span class="req">*</span></label>
            {#if archivo}
              <div class="doc-selected">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span class="doc-name">{archivo.name}</span>
                <button class="doc-remove" on:click={() => archivo = null}>✕</button>
              </div>
            {:else}
              <label class="doc-upload" for="archivo-input">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="16 16 12 12 8 16"/>
                  <line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
                Seleccionar archivo PDF
                <input id="archivo-input" type="file" accept=".pdf" style="display:none" on:change={onArchivo} />
              </label>
            {/if}
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-primary" style="max-width: 240px" on:click={enviarReporte} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar Reporte'}
          </button>
        </div>
      </div>

      <!-- Historial -->
      <div class="card">
        <h2 class="card-title">Historial de Reportes</h2>

        {#if reportes.length === 0}
          <p class="empty-msg">Aún no has enviado ningún reporte.</p>
        {:else}
          <div class="tabla-wrap">
            <table class="tabla">
              <thead>
                <tr>
                  <th>Semana</th>
                  <th>Calificación</th>
                  <th>Estado</th>
                  <th>Nota del agente</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {#each reportes as r}
                  <tr>
                    <td>Semana {r.semana}</td>
                    <td>{r.calificacion_alumno}</td>
                    <td><span class={estadoBadgeClass(r.estado)}>{r.estado}</span></td>
                    <td>{r.nota_agente || '—'}</td>
                    <td>{formatFecha(r.created_at)}</td>
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
  .page       { max-width: 860px; margin: 0 auto; padding: 32px 16px 64px; display: flex; flex-direction: column; gap: 24px; }
  .page-title { font-size: 24px; font-weight: 700; color: var(--text-primary); }

  .loading-wrap { display: flex; justify-content: center; padding: 60px; }
  .spinner-lg {
    width: 36px; height: 36px;
    border: 3px solid var(--border); border-top-color: var(--orange);
    border-radius: 50%; animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .card {
    background: var(--bg-card); border-radius: var(--radius-card);
    box-shadow: var(--shadow-card); padding: 28px 32px;
    display: flex; flex-direction: column; gap: 20px;
  }
  .card-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }

  /* Plantillas */
  .plantillas-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .plantilla-btn {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px;
    border: 1.5px solid var(--border); border-radius: var(--radius-input);
    background: var(--bg-page); cursor: pointer;
    font-family: var(--font); text-align: left; text-decoration: none;
    transition: border-color 0.15s, background 0.15s;
  }
  .plantilla-btn:hover       { border-color: var(--color); background: #fff; }
  .plantilla-disabled        { cursor: not-allowed; opacity: 0.6; }
  .plantilla-disabled:hover  { border-color: var(--border); background: var(--bg-page); }
  .plantilla-icon  { font-size: 24px; flex-shrink: 0; }
  .plantilla-label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .plantilla-ext   { font-size: 11px; color: var(--color); font-weight: 700; }
  .plantilla-pronto { color: var(--text-secondary) !important; font-weight: 500; }

  /* Formulario */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .field      { display: flex; flex-direction: column; gap: 6px; }
  .field label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .field-full { grid-column: 1 / -1; }
  .req        { color: var(--orange); }
  .form-actions { display: flex; }

  .doc-upload {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 14px;
    border: 1.5px dashed var(--border); border-radius: var(--radius-input);
    cursor: pointer; font-size: 13px; color: var(--text-secondary);
    transition: border-color 0.15s, color 0.15s;
  }
  .doc-upload:hover { border-color: var(--orange); color: var(--orange); }
  .doc-selected {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px;
    border: 1.5px solid var(--border); border-radius: var(--radius-input);
    background: var(--orange-light);
  }
  .doc-name   { flex: 1; font-size: 13px; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .doc-remove { background: none; border: none; cursor: pointer; color: var(--text-secondary); font-size: 14px; }
  .doc-remove:hover { color: #B91C1C; }

  /* Historial */
  .empty-msg  { font-size: 14px; color: var(--text-secondary); text-align: center; padding: 20px 0; }
  .tabla-wrap { overflow-x: auto; }
  .tabla      { width: 100%; border-collapse: collapse; font-size: 14px; }
  .tabla th {
    text-align: left; padding: 10px 14px;
    font-size: 12px; font-weight: 600; color: var(--text-secondary);
    border-bottom: 1.5px solid var(--border); white-space: nowrap;
  }
  .tabla td   { padding: 12px 14px; border-bottom: 1px solid var(--border); color: var(--text-primary); }
  .tabla tr:last-child td { border-bottom: none; }
  .tabla tr:hover td      { background: var(--bg-page); }

  .success-msg {
    background: #F0FDF4; border: 1px solid #BBF7D0; color: #15803D;
    border-radius: 8px; padding: 10px 14px; font-size: 13px; font-weight: 500;
  }

  @media (max-width: 640px) {
    .card            { padding: 20px 16px; }
    .plantillas-grid { grid-template-columns: 1fr; }
    .form-grid       { grid-template-columns: 1fr; }
  }
</style>
