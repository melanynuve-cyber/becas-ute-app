<script>
  export let label = '';
  export let value = '';
  export let type = 'text';
  export let disabled = false;
  export let placeholder = '';
  export let step = null;
  export let min = null;
  // Mensaje de error para borde rojo
  export let error = '';
  // Bloquea decimales, negativos y no-dígitos
  export let integerOnly = false;

  function onKeyDown(e) {
    if (!integerOnly) return
    if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
      e.preventDefault()
    }
  }

  function onInput(e) {
    if (!integerOnly) return
    const raw = e.target.value
    const clean = raw.replace(/\D/g, '')
    if (clean !== raw) {
      value = clean
    }
  }
</script>

<div class="tabla-row" class:tabla-row-error={error}>
  <span class="tabla-label">{label}</span>

  {#if type === 'number'}
    <input
      class="input-plain tabla-input"
      type="number"
      {disabled}
      {placeholder}
      {step}
      {min}
      inputmode={integerOnly ? 'numeric' : 'decimal'}
      bind:value
      on:keydown={onKeyDown}
      on:input={onInput}
    />
  {:else}
    <input
      class="input-plain tabla-input"
      type="text"
      {disabled}
      {placeholder}
      {step}
      {min}
      bind:value
    />
  {/if}

  {#if error}
    <span class="tabla-error-msg">{error}</span>
  {/if}
</div>

<style>
  .tabla-row {
    display: grid;
    grid-template-columns: 1fr 160px;
    align-items: center;
    border-bottom: 1px solid var(--border);
  }

  .tabla-row:last-child {
    border-bottom: none;
  }

  .tabla-row-error {
    background: rgba(239, 68, 68, 0.04);
  }

  .tabla-row-error .tabla-input {
    border-color: var(--error) !important;
  }

  .tabla-label {
    padding: 10px 14px;
    font-size: 13px;
    color: var(--text-primary);
  }

  .tabla-input {
    border: none !important;
    border-left: 1.5px solid var(--border) !important;
    border-radius: 0 !important;
    text-align: right;
  }

  .tabla-error-msg {
    grid-column: 1 / -1;
    padding: 4px 14px;
    font-size: 11px;
    color: var(--error);
    font-weight: 500;
    background: rgba(239, 68, 68, 0.06);
  }

  @media (max-width: 768px) {
    .tabla-row { grid-template-columns: 1fr 120px; }
  }
</style>
