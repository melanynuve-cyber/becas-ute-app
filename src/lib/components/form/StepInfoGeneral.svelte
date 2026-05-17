<script>
  // src/lib/components/form/StepInfoGeneral.svelte
  // Exportaciones de props y variables dependientes
  export let info
  export let tipoSolicitud 

  // Derivados reactivos de la solicitud
  $: esNuevo     = tipoSolicitud === 'Nueva'
  $: esRenovacion = tipoSolicitud === 'Renovacion'
</script>

<section>
  <div class="section-header">
    <span class="section-num">3.</span>
    <h2 class="section-title">Información General</h2>
  </div>
  <div class="divider-orange"></div>

  <div class="tabla-info">
    <div class="tabla-row">
      <span class="tabla-label">A. Promedio general de preparatoria (estudiante de nuevo ingreso)</span>
      <input class="input-plain tabla-input" type="number" step="0.1"
        disabled={esRenovacion} bind:value={info.promedio_preparatoria} />
    </div>
    <div class="tabla-row">
      <span class="tabla-label">B. Porcentaje de beca otorgada en el cuatrimestre anterior</span>
      <input class="input-plain tabla-input" type="number"
        disabled={esNuevo} bind:value={info.porcentaje_beca_anterior} />
    </div>
    <div class="tabla-row">
      <span class="tabla-label">C. Promedio cuatrimestre anterior (estudiante de reingreso)</span>
      <input class="input-plain tabla-input" type="number" step="0.1"
        disabled={esNuevo} bind:value={info.promedio_cuatrimestre_anterior} />
    </div>
    <div class="tabla-row">
      <span class="tabla-label">D. ¿Recibes otro tipo de beca interna o externa? Menciona la institución o empresa</span>
      <input class="input-plain tabla-input"
        placeholder="Ej. No, o Fundación X" bind:value={info.otra_beca} />
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
  @media (max-width: 640px) {
    .tabla-row { grid-template-columns: 1fr 120px; }
  }
</style>