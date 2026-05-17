// src/lib/components/form/StepDocumentos.svelte
<script>
  // Exportaciones
  export let archivos
  export let erroresArchivos = {}

  // Listado de documentos requeridos
  const docs = [
    { key: 'kardex',                  label: 'A. Kárdex (PDF)',                    requerido: true },
    { key: 'recibo_ingresos',         label: 'B. Recibo de Ingresos (PDF)',         requerido: true },
    { key: 'recibo_servicio_publico', label: 'C. Recibo de Servicio Público (PDF)', requerido: true },
    { key: 'recibo_inscripcion',      label: 'D. Comprobante de Inscripción (PDF)', requerido: false },
  ]

  // Manejador de carga de archivos
  function onArchivo(e, key) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      erroresArchivos = { ...erroresArchivos, [key]: 'Solo se aceptan archivos PDF' }
      return
    }
    erroresArchivos = { ...erroresArchivos, [key]: '' }
    archivos = { ...archivos, [key]: file }
  }

  // Remoción de archivo adjunto
  function quitarArchivo(key) {
    archivos = { ...archivos, [key]: null }
  }
</script>

<section>
  <div class="section-header">
    <span class="section-num">6.</span>
    <h2 class="section-title">Documentos Adjuntos</h2>
  </div>
  <div class="divider-orange"></div>
  <p class="section-hint">Los documentos A, B y C son obligatorios. D puede adjuntarse después. Solo se aceptan archivos PDF.</p>

  <div class="docs-grid">
    {#each docs as doc}
      <div class="doc-item">
        <span class="doc-label">
          {doc.label}
          {#if doc.requerido}<span class="req">*</span>{:else}<span class="opcional">(opcional)</span>{/if}
        </span>

        {#if archivos[doc.key]}
          <div class="doc-selected">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span class="doc-name">{archivos[doc.key].name}</span>
            <button class="doc-remove" on:click={() => quitarArchivo(doc.key)}>✕</button>
          </div>
        {:else}
          <label class="doc-upload">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 16 12 12 8 16"/>
              <line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
            Seleccionar archivo PDF
            <input type="file" accept=".pdf" style="display:none"
              on:change={(e) => onArchivo(e, doc.key)} />
          </label>
        {/if}

        {#if erroresArchivos[doc.key]}
          <span class="req" style="font-size:12px">{erroresArchivos[doc.key]}</span>
        {/if}
      </div>
    {/each}
  </div>
</section>

<style>
  section { display: flex; flex-direction: column; gap: 16px; }
  .section-header { display: flex; align-items: center; gap: 8px; }
  .section-num { font-size: 18px; font-weight: 700; color: var(--orange); }
  .section-title { font-size: 17px; font-weight: 600; color: var(--text-primary); }
  .divider-orange { height: 2px; background: var(--orange); border-radius: 2px; opacity: 0.3; }
  .section-hint { font-size: 13px; color: var(--text-secondary); }
  .req { color: var(--orange); }
  .opcional { font-size: 11px; color: var(--text-secondary); font-weight: 400; margin-left: 4px; }
  .docs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .doc-item { display: flex; flex-direction: column; gap: 6px; }
  .doc-label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .doc-upload {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 14px;
    border: 1.5px dashed var(--border-input);
    border-radius: var(--radius-input);
    cursor: pointer; font-size: 13px; color: var(--text-secondary);
    transition: border-color 0.15s, color 0.15s;
  }
  .doc-upload:hover { border-color: var(--orange); color: var(--orange); }
  .doc-selected {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px;
    border: 1.5px solid var(--border); border-radius: var(--radius-input);
    background: var(--orange-light);
    color: var(--orange);
  }
  .doc-name {
    flex: 1; font-size: 13px; color: var(--text-primary);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .doc-remove {
    background: none; border: none; cursor: pointer;
    color: var(--text-secondary); font-size: 14px; padding: 0 4px;
  }
  .doc-remove:hover { color: var(--error); }
  @media (max-width: 640px) {
    .docs-grid { grid-template-columns: 1fr; }
  }
</style>