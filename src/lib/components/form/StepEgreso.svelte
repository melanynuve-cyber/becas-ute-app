<script>
  // src/lib/components/form/StepEgreso.svelte
  // Exportación del objeto de egresos
  export let egreso

  // Cálculo reactivo del total de egresos
  $: total = [
    egreso.gastos_alimentacion,
    egreso.gastos_educacion,
    egreso.gastos_renta_hipoteca,
    egreso.gastos_servicios,
    egreso.gastos_varios,
  ].reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
</script>

<section>
  <div class="section-header">
    <span class="section-num">5.</span>
    <h2 class="section-title">Egreso Mensual</h2>
  </div>
  <div class="divider-orange"></div>

  <div class="tabla-info">
    <div class="tabla-row">
      <span class="tabla-label">A. Estimado en gastos de alimentación</span>
      <input class="input-plain tabla-input" type="number" min="0"
        placeholder="$0.00" bind:value={egreso.gastos_alimentacion} />
    </div>
    <div class="tabla-row">
      <span class="tabla-label">B. Estimado en gastos de educación</span>
      <input class="input-plain tabla-input" type="number" min="0"
        placeholder="$0.00" bind:value={egreso.gastos_educacion} />
    </div>
    <div class="tabla-row">
      <span class="tabla-label">C. Estimado en gastos de renta o pagos de préstamos hipotecarios (Infonavit)</span>
      <input class="input-plain tabla-input" type="number" min="0"
        placeholder="$0.00" bind:value={egreso.gastos_renta_hipoteca} />
    </div>
    <div class="tabla-row">
      <span class="tabla-label">D. Estimado en gastos de servicios (agua, luz, teléfono, etc.)</span>
      <input class="input-plain tabla-input" type="number" min="0"
        placeholder="$0.00" bind:value={egreso.gastos_servicios} />
    </div>
    <div class="tabla-row">
      <span class="tabla-label">E. Estimado en gastos varios</span>
      <input class="input-plain tabla-input" type="number" min="0"
        placeholder="$0.00" bind:value={egreso.gastos_varios} />
    </div>
    <div class="tabla-row tabla-total">
      <span class="tabla-label"><strong>Total de egresos</strong></span>
      <input class="input-plain tabla-input" value={`$${total.toFixed(2)}`} disabled />
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
  .tabla-total { background: var(--bg-page); }
  .tabla-label { padding: 10px 14px; font-size: 13px; color: var(--text-primary); }
  .tabla-input {
    border: none !important;
    border-left: 1.5px solid var(--border) !important;
    border-radius: 0 !important;
    text-align: right;
  }
  .tabla-input:focus { border-color: var(--orange) !important; }
  @media (max-width: 640px) {
    .tabla-row { grid-template-columns: 1fr 120px; }
  }
</style>