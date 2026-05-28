<script>
  export let id = '';
  export let label = '';
  export let value = '';
  export let type = 'text';
  export let placeholder = '';
  export let disabled = false;
  export let min = null;
  export let max = null;
  export let isSmall = false; 
  export let required = true;
</script>

<div class="field" class:field-sm={isSmall}>
  <label for={id}>{label} {#if required}<span class="req">*</span>{/if}</label>
  <input 
    {id}
    class="input-plain"
    {type}
    {placeholder}
    {disabled}
    {min}
    {max}
    bind:value
  />
</div>

<style>
  .field { 
    display: flex; 
    flex-direction: column; 
    gap: 6px; 
  }
  .field label { 
    font-size: 13px; 
    font-weight: 600; 
    color: var(--text-primary); 
  }
  .field-sm { max-width: 120px; }
  .req { color: var(--orange); }
</style>