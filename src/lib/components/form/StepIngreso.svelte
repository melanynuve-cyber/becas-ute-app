<script>
  import StepHeader from '../ui/StepHeader.svelte'
  import TableInputRow from '../ui/TableInputRow.svelte'

  export let ingreso
  export let errores = {}
</script>

<section>
  <StepHeader num="4" title="Ingreso Mensual" />

  <div class="tabla-info">
    <TableInputRow
      label="A. Monto de ingreso"
      type="number" min="0" placeholder="$0.00" bind:value={ingreso.monto_ingreso}
      error={errores.monto_ingreso || ''} />

    <TableInputRow
      label="B. Número de personas dependientes"
      type="number" min="0" placeholder="0" integerOnly bind:value={ingreso.numero_dependientes}
      error={errores.numero_dependientes || ''} />
  </div>
</section>

<style>
  section { display: flex; flex-direction: column; gap: 16px; }
  .tabla-info { 
    border: 1.5px solid var(--border); 
    border-radius: var(--radius-input); 
    overflow: hidden; 
  }
</style>