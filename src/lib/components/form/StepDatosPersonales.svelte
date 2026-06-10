<script>
  import StepHeader from '../ui/StepHeader.svelte'
  import InputField from '../ui/InputField.svelte'

  export let datos
  export let fechaFormato
  export let errores = {}
</script>

<section>
  <StepHeader num="1" title="Datos Personales" />

  <div class="row-3">
    <InputField id="fecha" label="Fecha" value={fechaFormato} disabled={true} />
    <InputField id="matricula" label="Matrícula" bind:value={datos.matricula} disabled={true} />
    <InputField id="cuatrimestre_cursar" label="Cuatrimestre a cursar" type="number" min="0" max="12" placeholder="0-12" bind:value={datos.cuatrimestre_a_cursar} error={errores.cuatrimestre_a_cursar || ''} />
  </div>

  <div class="row-3">
    <InputField id="nombres" label="Nombre(s)" bind:value={datos.nombres} error={errores.nombres || ''} />
    <InputField id="apellido_paterno" label="Apellido Paterno" bind:value={datos.apellido_paterno} error={errores.apellido_paterno || ''} />
    <InputField id="apellido_materno" label="Apellido Materno" bind:value={datos.apellido_materno} error={errores.apellido_materno || ''} />
  </div>

  <div class="row-3">
    <InputField id="programa_educativo" label="Programa educativo" bind:value={datos.programa_educativo} />

    <div class="field-custom">
      <label>Turno escolar</label>
      <div class="checkbox-row" class:checkbox-error={errores.turno}>
        <label class="check-label">
          <input type="checkbox" checked={datos.turno === 'M'} on:change={() => datos.turno = 'M'} /> M
        </label>
        <label class="check-label">
          <input type="checkbox" checked={datos.turno === 'V'} on:change={() => datos.turno = 'V'} /> V
        </label>
      </div>
      {#if errores.turno}
        <span class="field-error">{errores.turno}</span>
      {/if}
    </div>

    <InputField id="grupo" label="Grupo" bind:value={datos.grupo} error={errores.grupo || ''} />
  </div>

  <div class="row-2">
    <InputField id="domicilio_calle" label="Domicilio (Calle)" bind:value={datos.domicilio_calle} error={errores.domicilio_calle || ''} />
    <InputField id="domicilio_numero" label="No." isSmall={true} bind:value={datos.domicilio_numero} error={errores.domicilio_numero || ''} />
  </div>

  <div class="row-2">
    <InputField id="colonia" label="Colonia" bind:value={datos.colonia} error={errores.colonia || ''} />
    <InputField id="municipio" label="Municipio" bind:value={datos.municipio} error={errores.municipio || ''} />
  </div>

  <div class="row-1">
    <InputField id="correo_electronico" label="Correo electrónico" bind:value={datos.correo_electronico} disabled={true} />
  </div>

  <div class="row-3">
    <InputField id="estado_civil" label="Estado civil" bind:value={datos.estado_civil} error={errores.estado_civil || ''} />
    <InputField id="edad" label="Edad" type="number" integerOnly bind:value={datos.edad} error={errores.edad || ''} />
    <InputField id="celular" label="Celular" type="number" integerOnly bind:value={datos.celular} error={errores.celular || ''} />
  </div>

  <div class="row-2">
    <InputField id="rfc" label="RFC" bind:value={datos.rfc} error={errores.rfc || ''} />
    <InputField id="curp" label="CURP" bind:value={datos.curp} error={errores.curp || ''} />
  </div>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .row-1 { display: grid; grid-template-columns: 1fr; gap: 16px; }

  .field-custom { display: flex; flex-direction: column; gap: 6px; }
  .field-custom label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .req { color: var(--orange); }

  .checkbox-row {
    display: flex; gap: 20px; align-items: center; padding: 11px 14px;
    border: 1.5px solid var(--border-input); border-radius: var(--radius-input); background: var(--bg-card);
  }
  .checkbox-error {
    border-color: var(--error) !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
  }
  .check-label {
    display: flex; align-items: center; gap: 6px; font-size: 14px;
    cursor: pointer; accent-color: var(--orange);
  }
  .field-error { font-size: 11px; color: var(--error); font-weight: 500; }

  @media (max-width: 768px) {
    .row-3, .row-2 { grid-template-columns: 1fr; }
  }
</style>