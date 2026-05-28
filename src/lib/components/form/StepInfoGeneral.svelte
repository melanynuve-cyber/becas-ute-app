<script>
  import StepHeader from '../ui/StepHeader.svelte'
  import TableInputRow from '../ui/TableInputRow.svelte'

  export let info
  export let tipoSolicitud 

  $: esNuevo = tipoSolicitud === 'Nueva'
  $: esRenovacion = tipoSolicitud === 'Renovacion'
</script>

<section>
  <StepHeader num="3" title="Información General" />

  <div class="tabla-info">
    <TableInputRow 
      label="A. Promedio general de preparatoria (estudiante de nuevo ingreso)" 
      type="number" step="0.1" disabled={esRenovacion} bind:value={info.promedio_preparatoria} />
      
    <TableInputRow 
      label="B. Porcentaje de beca otorgada en el cuatrimestre anterior" 
      type="number" disabled={esNuevo} bind:value={info.porcentaje_beca_anterior} />
      
    <TableInputRow 
      label="C. Promedio cuatrimestre anterior (estudiante de reingreso)" 
      type="number" step="0.1" disabled={esNuevo} bind:value={info.promedio_cuatrimestre_anterior} />
      
    <TableInputRow 
      label="D. ¿Recibes otro tipo de beca interna o externa? Menciona la institución o empresa" 
      placeholder="Ej. No, o Fundación X" bind:value={info.otra_beca} />
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