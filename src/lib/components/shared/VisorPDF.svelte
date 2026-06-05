<script>
  // src/lib/components/shared/VisorPDF.svelte
  // Visor PDF embebido reutilizable — usado por CoordinadorDual,
  // CoordinadorCarrera y AdminDetalle
  export let url = ''
  export let titulo = 'Documento PDF'
</script>

{#if url}
  <div class="visor-wrap">
    <div class="visor-header">
      <span class="visor-title">{titulo}</span>
      <a href={url} target="_blank" rel="noopener noreferrer" class="visor-external">Abrir en pestaña nueva ↗</a>
    </div>
    <object data={url} type="application/pdf" class="visor-object">
      <p class="visor-fallback">
        Tu navegador no puede mostrar el PDF.
        <a href={url} target="_blank" rel="noopener noreferrer">Descargar archivo</a>
      </p>
    </object>
  </div>
{:else}
  <div class="visor-wrap visor-empty">
    <p class="visor-empty-text">No hay PDF disponible</p>
  </div>
{/if}

<style>
  .visor-wrap {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    overflow: hidden;
    background: #1e293b;
    height: 100%;
    min-height: 400px;
  }
  .visor-empty {
    background: var(--bg-page);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .visor-empty-text {
    color: var(--text-disabled);
    font-size: 14px;
    font-style: italic;
  }
  .visor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: var(--bg-page);
    border-bottom: 1px solid var(--border);
  }
  .visor-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-disabled);
  }
  .visor-external {
    font-size: 12px;
    font-weight: 500;
    color: var(--orange);
    text-decoration: none;
    transition: color 0.15s;
  }
  .visor-external:hover {
    color: var(--orange-hover);
    text-decoration: underline;
  }
  .visor-object {
    flex: 1;
    width: 100%;
    border: none;
    background: #fff;
  }
  .visor-fallback {
    padding: 40px;
    text-align: center;
    color: #94a3b8;
    font-size: 14px;
  }
  .visor-fallback a {
    color: var(--orange);
  }
</style>
