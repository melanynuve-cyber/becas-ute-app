<script>
  import StepHeader from '../ui/StepHeader.svelte'
  import { tiposBeca } from '../../utils/constants.js'

  export let form
  export let errores = {}
</script>

<section>
  <StepHeader num="2" title="Beca Solicitada" />

  <p class="section-hint">Marque con un espacio correspondiente a la beca a solicitar.</p>

  <div class="tipo-solicitud-row">
    <label class="check-label-big">
      <input type="radio" name="tipo_solicitud" value="Nueva" bind:group={form.beca_solicitada.tipo_solicitud} />
      Nueva Solicitud
    </label>

    <label class="check-label-big">
      <input type="radio" name="tipo_solicitud" value="Renovacion" bind:group={form.beca_solicitada.tipo_solicitud} />
      Renovación
    </label>
  </div>

  <div class="becas-grid" class:becas-error={errores.tipo_beca}>
    {#each tiposBeca as b}
      <label class="check-label-big">
        <input type="radio" name="tipo_beca" value={b.key} bind:group={form.beca_solicitada.tipo_beca} />
        {b.label}
      </label>
    {/each}
  </div>

  {#if errores.tipo_beca}
    <span class="field-error">{errores.tipo_beca}</span>
  {/if}
</section>

<style>
  section { display: flex; flex-direction: column; gap: 16px; }
  .section-hint { font-size: 13px; color: var(--text-secondary); margin-top: -8px; }
  .tipo-solicitud-row { display: flex; gap: 32px; }
  .becas-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px 16px; }
  .becas-error {
    border: 1.5px solid var(--error);
    border-radius: var(--radius-input);
    padding: 8px;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
  }

  .check-label-big {
    display: flex; align-items: center; gap: 8px; font-size: 14px;
    cursor: pointer; padding: 8px 0; accent-color: var(--orange);
  }

  .field-error { font-size: 11px; color: var(--error); font-weight: 500; }

  @media (max-width: 768px) {
    .becas-grid { grid-template-columns: 1fr; }
  }
</style>