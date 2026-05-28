<script>
  export let label = '';
  export let value = '';
  export let type = 'text';
  export let disabled = false;
  export let placeholder = '';
  export let step = null;
  export let min = null;
</script>

<div class="tabla-row">
  <span class="tabla-label">{label}</span>
  <input 
    class="input-plain tabla-input" 
    {type}
    {disabled}
    {placeholder}
    {step}
    {min}
    bind:value
  />
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
  @media (max-width: 768px) {
    .tabla-row { grid-template-columns: 1fr 120px; }
  }
</style>