// src/lib/components/form/StepIngreso.svelte
<script>
  // Exportación del objeto de ingresos
  export let ingreso
</script>

<section>
  <div class="section-header">
    <span class="section-num">4.</span>
    <h2 class="section-title">Ingreso Mensual</h2>
  </div>
  <div class="divider-orange"></div>

  <div class="tabla-info">
    <div class="tabla-row">
      <span class="tabla-label">A. Monto de ingreso</span>
      <input class="input-plain tabla-input" type="number" min="0"
        placeholder="$0.00" bind:value={ingreso.monto_ingreso} />
    </div>
    <div class="tabla-row">
      <span class="tabla-label">B. Número de personas dependientes</span>
      <input class="input-plain tabla-input" type="number" min="0"
        placeholder="0" bind:value={ingreso.numero_dependientes} />
    </div>
  </div>
</section>

<style>
  section { display: flex; flex-direction: column; gap: 16px; }
  .section-header { display: flex; align-items: center; gap: 8px; }
  .section-num { font-size: 18px; font-weight: 700; color: var(--orange); }
  .section-title { font-size: 17px; font-weight: 600; color: var(--text-primary); }
  .divider-orange { height: 2px; background: var(--orange); border-radius: 2px; opacity: 0.3; }
  .tabla-info { border: 1.5px solid var(--border); border-radius: var(--radius-input); overflow: hidden; }
  .tabla-row {
    display: grid; grid-template-columns: 1fr 160px;
    align-items: center; border-bottom: 1px solid var(--border);
  }
  .tabla-row:last-child { border-bottom: none; }
  .tabla-label { padding: 10px 14px; font-size: 13px; color: var(--text-primary); }
  .tabla-input {
    border: none !important;
    border-left: 1.5px solid var(--border) !important;
    border-radius: 0 !important;
    text-align: right;
  }
  .tabla-input:focus { border-color: var(--orange) !important; }
</style>