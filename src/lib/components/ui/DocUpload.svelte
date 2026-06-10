<script>
  // src/lib/components/ui/DocUpload.svelte
  export let label = '';
  export let requerido = false;
  export let file = null;
  export let error = '';
  export let onUpload = () => {};
  export let onRemove = () => {};
</script>

<div class="doc-item">
  <span class="doc-label">
    {label}
    {#if !requerido}
      <span class="opcional">(opcional)</span>
    {/if}
  </span>

  {#if file}
    <div class="doc-selected" class:doc-error={error}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2 H6 a2 2 0 0 0-2 2 v16 a2 2 0 0 0 2 2 h12 a2 2 0 0 0 2-2 V8z" />
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      <span class="doc-name">{file.name}</span>
      <button type="button" class="doc-remove" on:click={onRemove}>✕</button>
    </div>
  {:else}
    <label class="doc-upload" class:doc-upload-error={error}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="16 16 12 12 8 16"/>
        <line x1="12" y1="12" x2="12" y2="21"/>
        <path d="M20.39 18.39 A5 5 0 0 0 18 9 h-1.26 A8 8 0 1 0 3 16.3" />
      </svg>
      Seleccionar archivo PDF
      <input type="file" accept=".pdf" style="display:none" on:change={onUpload} />
    </label>
  {/if}

  {#if error}
    <span class="req error-inline-txt">{error}</span>
  {/if}
</div>

<style>
  .doc-item { 
    display: flex; 
    flex-direction: column; 
    gap: 6px; 
  }
  .doc-label { 
    font-size: 13px; 
    font-weight: 600; 
    color: var(--text-secondary); 
  }
  .req { 
    color: var(--orange); 
  }
  .opcional { 
    font-size: 11px; 
    color: var(--text-disabled); 
    font-weight: 500; 
    margin-left: 4px; 
    text-transform: uppercase;
    letter-spacing: 0.02em; 
  }
  .doc-upload {
    display: flex;
    align-items: center; 
    gap: 8px;
    padding: 12px 14px;
    border: 1.5px dashed var(--border-input);
    border-radius: var(--radius-input);
    cursor: pointer; 
    font-size: 13px; 
    color: var(--text-secondary);
    transition: border-color 0.15s, color 0.15s;
  }
  .doc-upload:hover { 
    border-color: var(--orange); 
    color: var(--orange); 
  }
  .doc-selected {
    display: flex; 
    align-items: center; 
    gap: 8px;
    padding: 10px 14px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-input);
    background: var(--orange-light);
    color: var(--orange);
  }
  .doc-name {
    flex: 1; 
    font-size: 13px; 
    color: var(--text-primary);
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .doc-remove {
    background: none; 
    border: none; 
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 14px; 
    padding: 0 4px;
    transition: color 0.15s ease;
  }
  .doc-remove:hover { 
    color: var(--error); 
  }
  .doc-upload-error {
    border-color: var(--error) !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
  }
  .doc-error {
    border-color: var(--error) !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
  }
  .error-inline-txt {
    font-size: 12px;
    font-weight: 500;
  }
</style>