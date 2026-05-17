// src/lib/components/form/StepBecaSolicitada.svelte
<script>
  // Exportación del formulario
  export let form

  // Catálogo de tipos de beca
  const tiposBeca = [
    { key: 'academica',     label: 'A. Académica' },
    { key: 'deportiva',     label: 'B. Deportiva' },
    { key: 'cultural',      label: 'C. Cultural' },
    { key: 'alimentos',     label: 'D. Alimentos' },
    { key: 'transporte',    label: 'E. Transporte' },
    { key: 'empleado_hijo', label: 'F. Empleado y/o hijo de empleado' },
  ]
</script>

<section>
  <div class="section-header">
    <span class="section-num">2.</span>
    <h2 class="section-title">Beca Solicitada</h2>
  </div>
  <div class="divider-orange"></div>
  <p class="section-hint">Marque con una "X" el espacio correspondiente a la beca a solicitar.</p>

  <div class="tipo-solicitud-row">
    <label class="check-label-big">
      <input type="radio" name="tipo_solicitud" value="Nueva"
        bind:group={form.beca_solicitada.tipo_solicitud} />
      Nueva Solicitud
    </label>
    <label class="check-label-big">
      <input type="radio" name="tipo_solicitud" value="Renovacion"
        bind:group={form.beca_solicitada.tipo_solicitud} />
      Renovación
    </label>
  </div>

  <div class="becas-grid">
    {#each tiposBeca as b}
      <label class="check-label-big">
        <input type="radio" name="tipo_beca" value={b.key}
          bind:group={form.beca_solicitada.tipo_beca} />
        {b.label}
      </label>
    {/each}
  </div>
</section>

<style>
  section { display: flex; flex-direction: column; gap: 16px; }
  .section-header { display: flex; align-items: center; gap: 8px; }
  .section-num { font-size: 18px; font-weight: 700; color: var(--orange); }
  .section-title { font-size: 17px; font-weight: 600; color: var(--text-primary); }
  .divider-orange { height: 2px; background: var(--orange); border-radius: 2px; opacity: 0.3; }
  .section-hint { font-size: 13px; color: var(--text-secondary); }
  .tipo-solicitud-row { display: flex; gap: 32px; }
  .becas-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px 16px; }
  .check-label-big {
    display: flex; align-items: center; gap: 8px;
    font-size: 14px; cursor: pointer; padding: 8px 0;
    accent-color: var(--orange);
  }
  @media (max-width: 640px) {
    .becas-grid { grid-template-columns: 1fr 1fr; }
  }
</style>