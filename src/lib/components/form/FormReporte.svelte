<script>
  // src/lib/components/form/FormReporte.svelte
  // Formulario de entrega de reporte dual — extraído de ReportesDual.svelte
  export let semana = ''
  export let calificacion = ''
  export let fechaInicio = ''
  export let fechaFin = ''
  export let archivo = null
  export let errorForm = ''
  export let enviando = false
  export let debugMode = false
  export let mostrarDebug = true

  export let onArchivo = (e) => {}
  export let onEnviar = () => {}
  export let onCancelar = () => {}
  export let onToggleDebug = () => {}

  let archivoInput
</script>

<div class="form-inline" on:click|stopPropagation>
  {#if errorForm}
    <div class="error-msg">{errorForm}</div>
  {/if}

  <div class="form-grid">
    <div class="field">
      <label>Semana asignada (Automático)</label>
      <input type="text" class="input-plain" value="Semana {semana}" disabled
        style="font-weight: 600; color: var(--text-primary); background: var(--bg-page);" />
    </div>

    <div class="field">
      <label for="calificacion">Calificación de la empresa <span class="req">*</span></label>
      <input id="calificacion" class="input-plain" type="number" min="1" max="10" step="0.1"
        placeholder="Ej. 9.5" bind:value={calificacion} />
    </div>

    <div class="field">
      <label>Periodo (Fecha de inicio) <span class="req">*</span></label>
      <input type="date" class="input-plain" bind:value={fechaInicio} />
    </div>

    <div class="field">
      <label>Periodo (Fecha de fin) <span class="req">*</span></label>
      <input type="date" class="input-plain" bind:value={fechaFin} />
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
          <input id="archivo-input" type="file" accept=".pdf" style="display:none"
            on:change={onArchivo} />
        </label>
      {/if}
    </div>
  </div>

  <div class="form-actions">
    {#if mostrarDebug}
      <button class="btn-debug" on:click={onToggleDebug} title="Omite la restricción de día viernes">
        {debugMode ? 'Debug ON' : 'Debug OFF'}
      </button>
    {/if}
    <button class="btn-outline" on:click={onCancelar}>Cancelar</button>
    <button class="btn-primary" on:click={onEnviar} disabled={enviando}>
      {enviando ? 'Subiendo...' : 'Enviar Reporte'}
    </button>
  </div>
</div>

<style>
  .form-inline { padding: 20px; background: var(--bg-page); border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 16px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
  .field-full { grid-column: 1 / -1; }
  .req { color: var(--orange); }
  .form-actions { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
  .btn-debug { background: none; border: 1.5px dashed var(--border); border-radius: 8px; padding: 7px 14px; font-size: 12px; font-weight: 600; color: var(--text-disabled); cursor: pointer; font-family: var(--font); transition: all 0.15s ease; margin-right: auto; }
  .btn-debug:hover { border-color: var(--text-disabled); color: var(--text-secondary); }
  .doc-upload { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 16px; border: 2px dashed var(--border-input); border-radius: var(--radius-input); cursor: pointer; font-size: 13px; font-weight: 500; color: var(--text-secondary); background: var(--bg-card); transition: all 0.15s ease; }
  .doc-upload:hover { border-color: var(--orange); color: var(--orange); background: var(--orange-light); }
  .doc-selected { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border: 1px solid rgba(249, 115, 22, 0.2); border-radius: var(--radius-input); background: var(--orange-light); }
  .doc-name { flex: 1; font-size: 13px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .doc-remove { background: none; border: none; cursor: pointer; color: var(--text-disabled); display: flex; align-items: center; transition: color 0.15s; }
  .doc-remove:hover { color: var(--error); }
</style>
