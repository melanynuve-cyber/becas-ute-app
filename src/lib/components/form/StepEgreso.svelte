<script>
  import StepHeader from '../ui/StepHeader.svelte'
  import TableInputRow from '../ui/TableInputRow.svelte'

  export let egreso
  export let errores = {}

  $: total = [
    egreso.gastos_alimentacion,
    egreso.gastos_educacion,
    egreso.gastos_renta_hipoteca,
    egreso.gastos_servicios,
    egreso.gastos_varios
  ].reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
</script>

<section>
  <StepHeader num="5" title="Egreso Mensual" />

  <div class="tabla-info">
    <TableInputRow
      label="A. Estimado en gastos de alimentación"
      type="number" min="0" placeholder="$0.00" integerOnly bind:value={egreso.gastos_alimentacion} />

    <TableInputRow
      label="B. Estimado en gastos de educación"
      type="number" min="0" placeholder="$0.00" bind:value={egreso.gastos_educacion} />

    <TableInputRow
      label="C. Estimado en gastos de renta o pagos de préstamos hipotecarios (Infonavit)"
      type="number" min="0" placeholder="$0.00" bind:value={egreso.gastos_renta_hipoteca} />

    <TableInputRow
      label="D. Estimado en gastos de servicios (agua, luz, teléfono, etc.)"
      type="number" min="0" placeholder="$0.00" bind:value={egreso.gastos_servicios} />

    <TableInputRow
      label="E. Estimado en gastos varios"
      type="number" min="0" placeholder="$0.00" bind:value={egreso.gastos_varios} />

    <div class="tabla-row tabla-total" class:tabla-row-error={errores.total_egresos}>
      <span class="tabla-label"><strong>Total de egresos</strong></span>
      <input class="input-plain tabla-input" value={`$${total.toFixed(2)}`} disabled />
      {#if errores.total_egresos}
        <span class="tabla-error-msg">{errores.total_egresos}</span>
      {/if}
    </div>
  </div>
</section>

<style>
  section { display: flex; flex-direction: column; gap: 16px; }
  .tabla-info { border: 1.5px solid var(--border); border-radius: var(--radius-input); overflow: hidden; }

  /* Mantengo estos estilos aquí porque el total de la tabla tiene un formato especial (bold y bg diferente) */
  .tabla-row { display: grid; grid-template-columns: 1fr 160px; align-items: center; }
  .tabla-total { background: var(--bg-page); }
  .tabla-label { padding: 10px 14px; font-size: 13px; color: var(--text-primary); }
  .tabla-input { border: none !important; border-left: 1.5px solid var(--border) !important; border-radius: 0 !important; text-align: right; }

  .tabla-row-error { background: rgba(239, 68, 68, 0.04); }
  .tabla-row-error .tabla-input { border-color: var(--error) !important; }
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