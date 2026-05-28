<script>
  // src/lib/components/ui/PreviewField.svelte
  export let label = '';
  export let value = '';
  export let isMono = false; // Útil para RFC, CURP, etc.
  export let highlight = false; // Útil para totales (negrita/color primario)
</script>

<div class="preview-field">
  <span class="preview-label">{label}</span>
  <span class="preview-value" class:font-mono={isMono} class:highlight={highlight}>
    {value || '—'}
  </span>
</div>

<style>
  .preview-field { 
    display: flex; 
    flex-direction: column; 
    gap: 4px; 
  }
  
  .preview-label { 
    font-size: 11px; 
    font-weight: 600; 
    color: var(--text-disabled); 
    text-transform: uppercase; 
    letter-spacing: 0.03em; 
  }

  .preview-value { 
    font-size: 14px; 
    font-weight: 500; 
    color: var(--text-secondary); 
    word-break: break-word; 
  }

  .font-mono { 
    font-family: monospace; 
    letter-spacing: 0.02em; 
  }

  .highlight {
    color: var(--text-primary); 
    font-weight: 700;
  }
</style>